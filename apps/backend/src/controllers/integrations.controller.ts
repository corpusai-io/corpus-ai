import { Response, Request } from 'express';
import {
  slackIntegration,
  zapierIntegration,
  googleDriveIntegration,
  googleDriveRefreshToken,
  telegramIntegration,
  whatsAppIntegration,
} from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { nanoid } from 'nanoid';

/**
 * List all integrations for a chatbot
 * GET /api/integrations/:chatbotId
 */
export async function listIntegrations(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Query all integration types
    const [slack, zapier, googleDrive, telegram, whatsApp] = await Promise.all([
      slackIntegration.query.primary({ chatbotId }).go().catch(() => ({ data: [] })),
      zapierIntegration.query.primary({ chatbotId }).go().catch(() => ({ data: [] })),
      googleDriveIntegration.query.primary({ chatbotId }).go().catch(() => ({ data: [] })),
      telegramIntegration.query.primary({ chatbotId }).go().catch(() => ({ data: [] })),
      whatsAppIntegration.query.primary({ chatbotId }).go().catch(() => ({ data: [] })),
    ]);

    const integrations = {
      slack: slack.data.length > 0 ? slack.data[0] : null,
      zapier: zapier.data.length > 0 ? zapier.data[0] : null,
      googleDrive: googleDrive.data.length > 0 ? googleDrive.data[0] : null,
      telegram: telegram.data.length > 0 ? telegram.data[0] : null,
      whatsApp: whatsApp.data.length > 0 ? whatsApp.data[0] : null,
    };

    res.json({
      success: true,
      integrations,
    });
  } catch (error) {
    console.error('Error listing integrations:', error);
    res.status(500).json({
      error: 'Failed to list integrations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ==================== SLACK ====================

/**
 * Slack OAuth callback (placeholder)
 * GET /api/integrations/slack/oauth
 */
export async function slackOAuthCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    // TODO: Implement Slack OAuth flow
    // 1. Exchange code for access token
    // 2. Get workspace info
    // 3. Store integration

    res.json({
      success: true,
      message: 'Slack OAuth callback (not implemented)',
      code,
      state,
    });
  } catch (error) {
    console.error('Error in Slack OAuth:', error);
    res.status(500).json({
      error: 'Failed to complete Slack OAuth',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Connect Slack to chatbot
 * POST /api/integrations/slack/:chatbotId
 */
export async function connectSlack(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { token, workspaceId, workspaceName } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!token || !workspaceId) {
      return res.status(400).json({
        error: 'token and workspaceId are required',
      });
    }

    // Create or update Slack integration
    const result = await slackIntegration
      .put({
        chatbotId,
        workspaceId,
        workspaceName: workspaceName || 'Workspace',
        token,
      })
      .go();

    res.json({
      success: true,
      integration: result.data,
    });
  } catch (error) {
    console.error('Error connecting Slack:', error);
    res.status(500).json({
      error: 'Failed to connect Slack',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Disconnect Slack from chatbot
 * DELETE /api/integrations/slack/:chatbotId
 */
export async function disconnectSlack(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get existing integration to get workspaceId
    const existing = await slackIntegration.query.primary({ chatbotId }).go();

    if (existing.data.length === 0) {
      return res.status(404).json({ error: 'Slack integration not found' });
    }

    await slackIntegration.delete({ chatbotId }).go();

    res.json({
      success: true,
      message: 'Slack integration disconnected',
    });
  } catch (error) {
    console.error('Error disconnecting Slack:', error);
    res.status(500).json({
      error: 'Failed to disconnect Slack',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ==================== ZAPIER ====================

/**
 * Subscribe Zapier webhook
 * POST /api/integrations/zapier/subscribe
 */
export async function zapierSubscribe(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, hookUrl, hookType } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!chatbotId || !hookUrl || !hookType) {
      return res.status(400).json({
        error: 'chatbotId, hookUrl, and hookType are required',
      });
    }

    const result = await zapierIntegration
      .put({
        chatbotId,
        hookUrl,
        hookType,
      })
      .go();

    res.json({
      success: true,
      integration: result.data,
    });
  } catch (error) {
    console.error('Error subscribing Zapier:', error);
    res.status(500).json({
      error: 'Failed to subscribe Zapier',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Unsubscribe Zapier webhook
 * DELETE /api/integrations/zapier/unsubscribe
 */
export async function zapierUnsubscribe(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, hookType } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!chatbotId || !hookType) {
      return res.status(400).json({
        error: 'chatbotId and hookType are required',
      });
    }

    await zapierIntegration
      .delete({
        chatbotId,
        hookType,
      })
      .go();

    res.json({
      success: true,
      message: 'Zapier webhook unsubscribed',
    });
  } catch (error) {
    console.error('Error unsubscribing Zapier:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe Zapier',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get sample data for Zapier
 * GET /api/integrations/zapier/samples
 */
export async function zapierSamples(req: Request, res: Response) {
  res.json({
    success: true,
    samples: [
      {
        leadId: 'lead-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        chatbotId: 'bot-abc123',
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

// ==================== GOOGLE DRIVE ====================

/**
 * List Google Drive profiles for user
 * GET /api/integrations/google-drive/profiles
 */
export async function listGoogleDriveProfiles(req: AuthRequest, res: Response) {
  try {
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Query user's Google Drive profiles
    const result = await googleDriveRefreshToken.query
      .byUsername({ username })
      .go();

    res.json({
      success: true,
      profiles: result.data,
    });
  } catch (error) {
    console.error('Error listing Google Drive profiles:', error);
    res.status(500).json({
      error: 'Failed to list Google Drive profiles',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Connect Google Drive to chatbot
 * POST /api/integrations/google-drive/:chatbotId
 */
export async function connectGoogleDrive(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { googleProfileId, refreshToken, profileName, profileEmail } = req.body;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!googleProfileId) {
      return res.status(400).json({
        error: 'googleProfileId is required',
      });
    }

    // Store refresh token if provided
    if (refreshToken) {
      await googleDriveRefreshToken
        .put({
          googleProfileId,
          googleProfileName: profileName || '',
          googleProfileEmail: profileEmail || '',
          refreshToken,
          username,
        })
        .go();
    }

    // Link chatbot to Google Drive profile
    const result = await googleDriveIntegration
      .put({
        chatbotId,
        googleProfileId,
      })
      .go();

    res.json({
      success: true,
      integration: result.data,
    });
  } catch (error) {
    console.error('Error connecting Google Drive:', error);
    res.status(500).json({
      error: 'Failed to connect Google Drive',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Disconnect Google Drive from chatbot
 * DELETE /api/integrations/google-drive/:chatbotId
 */
export async function disconnectGoogleDrive(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get existing integration
    const existing = await googleDriveIntegration.query
      .primary({ chatbotId })
      .go();

    if (existing.data.length === 0) {
      return res.status(404).json({ error: 'Google Drive integration not found' });
    }

    await googleDriveIntegration.delete({ chatbotId }).go();

    res.json({
      success: true,
      message: 'Google Drive integration disconnected',
    });
  } catch (error) {
    console.error('Error disconnecting Google Drive:', error);
    res.status(500).json({
      error: 'Failed to disconnect Google Drive',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ==================== TELEGRAM ====================

/**
 * Connect Telegram to chatbot
 * POST /api/integrations/telegram/:chatbotId
 */
export async function connectTelegram(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { httpToken, secretKey, botId } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!httpToken || !botId) {
      return res.status(400).json({
        error: 'httpToken and botId are required',
      });
    }

    const result = await telegramIntegration
      .put({
        chatbotId,
        httpToken,
        secretKey: secretKey || nanoid(32),
        botId,
      })
      .go();

    res.json({
      success: true,
      integration: result.data,
    });
  } catch (error) {
    console.error('Error connecting Telegram:', error);
    res.status(500).json({
      error: 'Failed to connect Telegram',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Disconnect Telegram from chatbot
 * DELETE /api/integrations/telegram/:chatbotId
 */
export async function disconnectTelegram(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existing = await telegramIntegration.query.primary({ chatbotId }).go();

    if (existing.data.length === 0) {
      return res.status(404).json({ error: 'Telegram integration not found' });
    }

    await telegramIntegration.delete({ chatbotId }).go();

    res.json({
      success: true,
      message: 'Telegram integration disconnected',
    });
  } catch (error) {
    console.error('Error disconnecting Telegram:', error);
    res.status(500).json({
      error: 'Failed to disconnect Telegram',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ==================== WHATSAPP ====================

/**
 * Connect WhatsApp to chatbot
 * POST /api/integrations/whatsapp/:chatbotId
 */
export async function connectWhatsApp(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { businessAccountId, phoneNumberId, accessToken, verificationToken } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({
        error: 'phoneNumberId and accessToken are required',
      });
    }

    const result = await whatsAppIntegration
      .put({
        chatbotId,
        businessAccountId: businessAccountId || '',
        phoneNumberId,
        accessToken,
        verificationToken: verificationToken || nanoid(32),
      })
      .go();

    res.json({
      success: true,
      integration: result.data,
    });
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    res.status(500).json({
      error: 'Failed to connect WhatsApp',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Disconnect WhatsApp from chatbot
 * DELETE /api/integrations/whatsapp/:chatbotId
 */
export async function disconnectWhatsApp(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existing = await whatsAppIntegration.query.primary({ chatbotId }).go();

    if (existing.data.length === 0) {
      return res.status(404).json({ error: 'WhatsApp integration not found' });
    }

    await whatsAppIntegration
      .delete({
        chatbotId,
        phoneNumberId: existing.data[0].phoneNumberId,
      })
      .go();

    res.json({
      success: true,
      message: 'WhatsApp integration disconnected',
    });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({
      error: 'Failed to disconnect WhatsApp',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
