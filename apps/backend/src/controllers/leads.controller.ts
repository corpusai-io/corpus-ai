import { Response } from 'express';
import { leadData, leadFields } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { nanoid } from 'nanoid';
import { Request } from 'express';

/**
 * List leads for a chatbot with pagination
 * GET /api/leads/:chatbotId
 */
export async function listLeads(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { limit = 50, cursor } = req.query;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Query leads using the GSI
    const result = await leadData.query
      .byChatbotId({ chatbotId })
      .go({
        limit: Number(limit),
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
    res.status(500).json({
      error: 'Failed to list leads',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Add a lead (NO AUTH - used by public chatbot)
 * POST /api/leads/:chatbotId
 */
export async function addLead(req: Request, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { name, email, phone, customFields, fieldsId } = req.body;

    if (!email && !name) {
      return res.status(400).json({
        error: 'At least name or email is required',
      });
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
      })
      .go();

    // TODO: Send email notification to chatbot owner
    // TODO: Trigger Zapier webhook if configured

    res.status(201).json({
      success: true,
      lead: lead.data,
    });
  } catch (error) {
    console.error('Error adding lead:', error);
    res.status(500).json({
      error: 'Failed to add lead',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all leads
    let allLeads: any[] = [];
    let cursor: string | undefined = undefined;

    do {
      const result = await leadData.query
        .byChatbotId({ chatbotId })
        .go({
          limit: 100,
          cursor,
        });

      allLeads = [...allLeads, ...result.data];
      cursor = result.cursor || undefined;
    } while (cursor);

    // Convert to CSV
    if (allLeads.length === 0) {
      return res.status(404).json({
        error: 'No leads found',
      });
    }

    // Get all unique keys from lead data
    const allKeys = new Set<string>();
    allLeads.forEach((lead) => {
      if (lead.data) {
        Object.keys(lead.data).forEach((key) => allKeys.add(key));
      }
    });

    const headers = ['ID', 'Created At', ...Array.from(allKeys)];
    const csvRows = [headers.join(',')];

    allLeads.forEach((lead) => {
      const row = [
        lead.dataId,
        lead.dataCreatedAt,
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
    res.status(500).json({
      error: 'Failed to export leads',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update lead form fields
 * PUT /api/leads/:chatbotId/fields
 */
export async function updateLeadFields(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { title, fields: fieldsList } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!Array.isArray(fieldsList)) {
      return res.status(400).json({
        error: 'fields must be an array',
      });
    }

    const fieldsId = 'default';

    // Create or update lead fields
    const result = await leadFields
      .put({
        chatbotId,
        fieldsId,
        title: title || 'Contact Form',
        fields: fieldsList,
      })
      .go();

    res.json({
      success: true,
      fields: result.data,
    });
  } catch (error) {
    console.error('Error updating lead fields:', error);
    res.status(500).json({
      error: 'Failed to update lead fields',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get lead form configuration
 * GET /api/leads/:chatbotId/fields
 */
export async function getLeadFields(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

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
        },
      });
    }

    res.json({
      success: true,
      fields: result.data,
    });
  } catch (error) {
    console.error('Error getting lead fields:', error);
    res.status(500).json({
      error: 'Failed to get lead fields',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
