import { Response } from 'express';
import { leadData, leadFields, ChatbotModel, ChatHistoryModel, zapierIntegration } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorResponse, ErrorCodes } from '../utils/error-response';
import { sendLeadNotificationEmail } from '../services/email.service';
import { nanoid } from 'nanoid';
import { Request } from 'express';

// Intent classification keyword patterns
const HOT_PATTERNS = /\b(pricing|price|cost|buy|purchase|demo|trial|availability|quote|urgent|subscribe|sign\s*up|order|payment|plan|upgrade)\b/i;
const WARM_PATTERNS = /\b(feature|compare|comparison|how\s+does|integrate|integration|customize|requirement|use\s+case|support|capability|option|alternative)\b/i;

/**
 * Classify lead intent based on conversation messages
 */
function classifyLeadIntent(messages: string[]): 'hot' | 'warm' | 'cold' {
  const combined = messages.join(' ');
  if (HOT_PATTERNS.test(combined)) return 'hot';
  if (WARM_PATTERNS.test(combined)) return 'warm';
  return 'cold';
}

/**
 * Fire Zapier webhook for new lead (fire-and-forget)
 */
async function fireZapierWebhook(chatbotId: string, leadRecord: any) {
  try {
    const result = await zapierIntegration.query
      .primary({ chatbotId })
      .go();

    const hooks = (result.data || []).filter((h: any) => h.hookType === 'new_lead');
    if (hooks.length > 0) {
      const hook = hooks[0];
      if (hook.hookUrl) {
        fetch(hook.hookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_lead',
            chatbotId,
            lead: leadRecord,
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.warn('[LEADS] Zapier webhook failed:', err.message);
        });
      }
    }
  } catch (err) {
    console.warn('[LEADS] Could not query Zapier integrations:', err);
  }
}

/**
 * List leads for a chatbot with pagination, search, and date filtering
 * GET /api/leads/:chatbotId?search=&startDate=&endDate=&limit=&cursor=&intent=&status=
 */
export async function listLeads(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { limit = 50, cursor, search, startDate, endDate, intent, status } = req.query;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const parsedLimit = Math.min(Math.max(1, Number(limit) || 50), 200);

    // If any filter is provided, we need to fetch all and filter in memory
    if (search || (startDate && endDate) || intent || status) {
      let allLeads: any[] = [];
      let pageCursor: string | undefined = undefined;

      do {
        const result: any = await leadData.query
          .byChatbotId({ chatbotId })
          .go({
            limit: 200,
            cursor: pageCursor,
          });

        allLeads = [...allLeads, ...result.data];
        pageCursor = result.cursor || undefined;
      } while (pageCursor);

      // Apply search filter
      if (search) {
        const searchLower = (search as string).toLowerCase();
        allLeads = allLeads.filter((lead) => {
          const data = lead.data || {};
          return (
            data.name?.toLowerCase().includes(searchLower) ||
            data.email?.toLowerCase().includes(searchLower) ||
            data.phone?.toLowerCase().includes(searchLower)
          );
        });
      }

      // Apply date range filter
      if (startDate && endDate) {
        const start = new Date(startDate as string).getTime();
        const end = new Date(`${endDate}T23:59:59`).getTime();
        allLeads = allLeads.filter((lead) => {
          const created = new Date(lead.dataCreatedAt).getTime();
          return created >= start && created <= end;
        });
      }

      // Apply intent filter
      if (intent) {
        allLeads = allLeads.filter((lead) => lead.intent === intent);
      }

      // Apply status filter
      if (status) {
        allLeads = allLeads.filter((lead) => (lead.status || 'new') === status);
      }

      // Manual pagination
      const cursorIndex = cursor ? Number(cursor) : 0;
      const paginated = allLeads.slice(cursorIndex, cursorIndex + parsedLimit);
      const nextCursor = cursorIndex + parsedLimit < allLeads.length
        ? String(cursorIndex + parsedLimit)
        : null;

      return res.json({
        success: true,
        leads: paginated,
        cursor: nextCursor,
        count: paginated.length,
        total: allLeads.length,
      });
    }

    // Standard paginated query (no filters)
    const result = await leadData.query
      .byChatbotId({ chatbotId })
      .go({
        limit: parsedLimit,
        cursor: cursor as string | undefined,
      });

    res.json({
      success: true,
      leads: result.data,
      cursor: result.cursor,
      count: result.data.length,
    });
  } catch (error) {
    console.error('Error listing leads:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to list leads');
  }
}

/**
 * Add a lead (NO AUTH - used by public chatbot)
 * POST /api/leads/:chatbotId
 */
export async function addLead(req: Request, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { name, email, phone, customFields, fieldsId, sessionId, triggerType, sourcePage } = req.body;

    if (!chatbotId || typeof chatbotId !== 'string') {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Invalid chatbot ID');
    }

    if (!email && !name) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'At least name or email is required');
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Invalid email format');
    }

    // Validate field lengths
    if (name && name.length > 200) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Name must be under 200 characters');
    }
    if (email && email.length > 254) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Email must be under 254 characters');
    }
    if (phone && phone.length > 30) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Phone must be under 30 characters');
    }

    // Classify intent from conversation history
    let intent: 'hot' | 'warm' | 'cold' = 'cold';
    if (sessionId) {
      try {
        const history = await ChatHistoryModel.query('chatbotId').eq(chatbotId).exec();
        const sessionMessages = history
          .filter((msg: any) => msg.sessionId === sessionId && msg.role === 'user')
          .slice(-20)
          .map((msg: any) => msg.content || '');
        intent = classifyLeadIntent(sessionMessages);
      } catch (err) {
        console.warn('[LEADS] Could not classify intent:', err);
      }
    }

    const dataId = nanoid(16);

    // Create lead data
    const lead = await leadData
      .create({
        dataId,
        chatbotId,
        fieldsId: fieldsId || 'default',
        data: {
          name,
          email,
          phone,
          ...customFields,
        },
        sessionId: sessionId || undefined,
        intent,
        status: 'new',
        triggerType: triggerType || undefined,
        sourcePage: sourcePage || undefined,
      })
      .go();

    // Fire-and-forget: notify chatbot owner about the new lead
    try {
      const chatbot = await ChatbotModel.get(chatbotId);
      if (chatbot && chatbot.username) {
        sendLeadNotificationEmail(
          chatbot.username,
          chatbot.title || chatbotId,
          email || '',
          name || '',
        );
      }
    } catch (lookupErr) {
      console.warn('[LEADS] Could not look up chatbot owner for email notification:', lookupErr);
    }

    // Fire Zapier webhook if configured
    fireZapierWebhook(chatbotId, lead.data);

    res.status(201).json({
      success: true,
      lead: lead.data,
    });
  } catch (error) {
    console.error('Error adding lead:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to add lead');
  }
}

/**
 * Get a single lead with conversation transcript
 * GET /api/leads/:chatbotId/:dataId
 */
export async function getLead(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, dataId } = req.params;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const result = await leadData.get({ chatbotId, dataId }).go();

    if (!result.data) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Lead not found');
    }

    const lead = result.data;

    // Fetch conversation transcript if sessionId exists
    let transcript: any[] = [];
    if (lead.sessionId) {
      try {
        const history = await ChatHistoryModel.query('chatbotId').eq(chatbotId).exec();
        transcript = history
          .filter((msg: any) => msg.sessionId === lead.sessionId)
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
          }));
      } catch (err) {
        console.warn('[LEADS] Could not fetch transcript:', err);
      }
    }

    res.json({
      success: true,
      lead,
      transcript,
    });
  } catch (error) {
    console.error('Error getting lead:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to get lead');
  }
}

/**
 * Update a lead's status and notes
 * PUT /api/leads/:chatbotId/:dataId
 */
export async function updateLead(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, dataId } = req.params;
    const { status, notes } = req.body;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const validStatuses = ['new', 'contacted', 'converted', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, `Status must be one of: ${validStatuses.join(', ')}`);
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Notes must be a string');
    }

    if (notes && notes.length > 5000) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Notes must be under 5000 characters');
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const result = await leadData
      .patch({ chatbotId, dataId })
      .set(updateData)
      .go({ response: 'all_new' });

    res.json({
      success: true,
      lead: result.data,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to update lead');
  }
}

/**
 * Get lead analytics
 * GET /api/leads/:chatbotId/analytics
 */
export async function getLeadAnalytics(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    // Fetch all leads
    let allLeads: any[] = [];
    let pageCursor: string | undefined = undefined;

    do {
      const result: any = await leadData.query
        .byChatbotId({ chatbotId })
        .go({
          limit: 200,
          cursor: pageCursor,
        });

      allLeads = [...allLeads, ...result.data];
      pageCursor = result.cursor || undefined;
    } while (pageCursor);

    // Intent breakdown
    const intentBreakdown = { hot: 0, warm: 0, cold: 0 };
    allLeads.forEach((lead) => {
      const intent = lead.intent || 'cold';
      if (intent in intentBreakdown) {
        intentBreakdown[intent as keyof typeof intentBreakdown]++;
      }
    });

    // Status breakdown
    const statusBreakdown = { new: 0, contacted: 0, converted: 0, archived: 0 };
    allLeads.forEach((lead) => {
      const status = lead.status || 'new';
      if (status in statusBreakdown) {
        statusBreakdown[status as keyof typeof statusBreakdown]++;
      }
    });

    // Leads over time (last 30 days, grouped by day)
    const leadsOverTime: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      leadsOverTime[key] = 0;
    }

    allLeads.forEach((lead) => {
      if (lead.dataCreatedAt) {
        const day = lead.dataCreatedAt.slice(0, 10);
        if (day in leadsOverTime) {
          leadsOverTime[day]++;
        }
      }
    });

    res.json({
      success: true,
      analytics: {
        total: allLeads.length,
        intentBreakdown,
        statusBreakdown,
        leadsOverTime,
      },
    });
  } catch (error) {
    console.error('Error getting lead analytics:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to get lead analytics');
  }
}

/**
 * Export leads as CSV
 * GET /api/leads/:chatbotId/export
 */
export async function exportLeads(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    // Get all leads
    let allLeads: any[] = [];
    let exportCursor: string | undefined = undefined;

    do {
      const result: any = await leadData.query
        .byChatbotId({ chatbotId })
        .go({
          limit: 100,
          cursor: exportCursor,
        });

      allLeads = [...allLeads, ...result.data];
      exportCursor = result.cursor || undefined;
    } while (exportCursor);

    // Convert to CSV
    if (allLeads.length === 0) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'No leads found');
    }

    // Get all unique keys from lead data
    const allKeys = new Set<string>();
    allLeads.forEach((lead) => {
      if (lead.data) {
        Object.keys(lead.data).forEach((key) => allKeys.add(key));
      }
    });

    const headers = ['ID', 'Created At', 'Intent', 'Status', 'Trigger', 'Source Page', ...Array.from(allKeys)];
    const csvRows = [headers.join(',')];

    allLeads.forEach((lead) => {
      const row = [
        lead.dataId,
        lead.dataCreatedAt,
        lead.intent || '',
        lead.status || 'new',
        lead.triggerType || '',
        lead.sourcePage || '',
        ...Array.from(allKeys).map((key) => {
          const value = lead.data?.[key] || '';
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        }),
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="leads-${chatbotId}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting leads:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to export leads');
  }
}

/**
 * Update lead form fields and trigger config
 * PUT /api/leads/:chatbotId/fields
 */
export async function updateLeadFields(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { title, fields: fieldsList, triggerConfig } = req.body;

    if (!req.user?.email) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    if (!Array.isArray(fieldsList)) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'fields must be an array');
    }

    if (fieldsList.length > 20) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Maximum 20 fields allowed');
    }

    if (title && title.length > 100) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Title must be under 100 characters');
    }

    // Validate triggerConfig if provided
    if (triggerConfig) {
      const validTriggers = ['gated', 'after_messages', 'high_intent', 'cant_answer', 'exit_intent'];
      if (triggerConfig.triggerType && !validTriggers.includes(triggerConfig.triggerType)) {
        return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, `triggerType must be one of: ${validTriggers.join(', ')}`);
      }
      const validStyles = ['popup', 'inline'];
      if (triggerConfig.formStyle && !validStyles.includes(triggerConfig.formStyle)) {
        return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, `formStyle must be one of: ${validStyles.join(', ')}`);
      }
    }

    const fieldsId = 'default';

    const putData: any = {
      chatbotId,
      fieldsId,
      title: title || 'Contact Form',
      fields: fieldsList,
    };

    if (triggerConfig) {
      putData.triggerConfig = {
        triggerType: triggerConfig.triggerType || 'gated',
        messageThreshold: triggerConfig.messageThreshold || 3,
        formStyle: triggerConfig.formStyle || 'popup',
        enabled: triggerConfig.enabled ?? false,
      };
    }

    // Create or update lead fields
    const result = await leadFields.put(putData).go();

    res.json({
      success: true,
      fields: result.data,
    });
  } catch (error) {
    console.error('Error updating lead fields:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to update lead fields');
  }
}

/**
 * Get lead form configuration (public - also used by widget)
 * GET /api/leads/:chatbotId/fields
 */
export async function getLeadFields(req: Request, res: Response) {
  try {
    const { chatbotId } = req.params;

    const fieldsId = 'default';

    // Get lead fields
    const result = await leadFields
      .get({
        chatbotId,
        fieldsId,
      })
      .go();

    if (!result.data) {
      // Return default fields if not configured
      return res.json({
        success: true,
        fields: {
          chatbotId,
          fieldsId,
          title: 'Contact Form',
          fields: [
            {
              key: 'name',
              name: 'Name',
              description: 'Your full name',
              required: true,
            },
            {
              key: 'email',
              name: 'Email',
              description: 'Your email address',
              required: true,
            },
            {
              key: 'phone',
              name: 'Phone',
              description: 'Your phone number',
              required: false,
            },
          ],
          triggerConfig: null,
        },
      });
    }

    res.json({
      success: true,
      fields: result.data,
    });
  } catch (error) {
    console.error('Error getting lead fields:', error);
    errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to get lead fields');
  }
}
