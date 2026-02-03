import { Response } from 'express';
import { ChatbotModel, getChatbotById, sendBuildMessage, sendRebuildMessage } from '@corpusai/aws-common';
import { nanoid } from 'nanoid';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Create a new chatbot
 * POST /api/chatbots
 */
export async function createChatbot(req: AuthRequest, res: Response) {
  try {
    const { title, desc, origin, language, files } = req.body;

    // Get username from authenticated user
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const username = req.user.email;

    // Validate required fields
    if (!origin) {
      return res.status(400).json({
        error: 'Missing required field: origin'
      });
    }

    // Generate unique IDs
    const chatbotId = `bot-${nanoid(12)}`;
    const indexName = `${chatbotId}-index`;
    const subdomain = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-') : chatbotId;

    // Create chatbot record
    const chatbot = new ChatbotModel({
      chatbotId,
      username,
      title: title || 'Untitled Chatbot',
      desc: desc || '',
      origin,
      indexName,
      subdomain,
      language: language || 'en',
      status: 'BUILDING',
      accessMode: 'PRIVATE',
      apiKeyHashSalt: nanoid(16),
      apiKeyHashIterations: 10000,
      hashedApiKey: nanoid(32),
      webCountUsage: 0,
      fileSizeUsage: 0,
      step: 0,
    });

    await chatbot.save();

    // Send build message to SQS
    try {
      await sendBuildMessage({
        chatbotId,
        username,
        origin,
        indexName,
        language: language || 'en',
        files: files || [],
      });
    } catch (sqsError) {
      console.error('Error sending build message:', sqsError);
      // Don't fail the request if SQS fails
    }

    res.status(201).json({
      success: true,
      chatbot: {
        chatbotId: chatbot.chatbotId,
        title: chatbot.title,
        desc: chatbot.desc,
        origin: chatbot.origin,
        status: chatbot.status,
        language: chatbot.language,
        subdomain: chatbot.subdomain,
        createdAt: chatbot.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating chatbot:', error);
    res.status(500).json({
      error: 'Failed to create chatbot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * List all chatbots for authenticated user
 * GET /api/chatbots
 */
export async function listChatbots(req: AuthRequest, res: Response) {
  try {
    // Get username from authenticated user
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const username = req.user.email;

    // Query chatbots by username using secondary index
    const chatbots = await ChatbotModel.query('username').eq(username).exec();

    res.json({
      success: true,
      count: chatbots.count,
      chatbots: chatbots.map((bot) => ({
        chatbotId: bot.chatbotId,
        title: bot.title,
        desc: bot.desc,
        origin: bot.origin,
        status: bot.status,
        language: bot.language,
        subdomain: bot.subdomain,
        accessMode: bot.accessMode,
        webCountUsage: bot.webCountUsage,
        fileSizeUsage: bot.fileSizeUsage,
        createdAt: bot.createdAt,
        updatedAt: bot.updatedAt,
        step: bot.step,
        errorStep: bot.errorStep,
        errorMessage: bot.errorMessage,
      })),
    });
  } catch (error) {
    console.error('Error listing chatbots:', error);
    res.status(500).json({
      error: 'Failed to list chatbots',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get a single chatbot by ID
 * GET /api/chatbots/:id
 */
export async function getChatbot(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found'
      });
    }

    // Verify ownership
    if (chatbot.username !== req.user.email) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own chatbots'
      });
    }

    res.json({
      success: true,
      chatbot: {
        chatbotId: chatbot.chatbotId,
        username: chatbot.username,
        title: chatbot.title,
        desc: chatbot.desc,
        origin: chatbot.origin,
        indexName: chatbot.indexName,
        status: chatbot.status,
        language: chatbot.language,
        subdomain: chatbot.subdomain,
        accessMode: chatbot.accessMode,
        webCountUsage: chatbot.webCountUsage,
        fileSizeUsage: chatbot.fileSizeUsage,
        createdAt: chatbot.createdAt,
        updatedAt: chatbot.updatedAt,
        step: chatbot.step,
        errorStep: chatbot.errorStep,
        errorMessage: chatbot.errorMessage,
        lastRebuildDateTime: chatbot.lastRebuildDateTime,
      },
    });
  } catch (error) {
    console.error('Error getting chatbot:', error);
    res.status(500).json({
      error: 'Failed to get chatbot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update a chatbot
 * PUT /api/chatbots/:id
 */
export async function updateChatbot(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, desc, accessMode, language } = req.body;

    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found'
      });
    }

    // Verify ownership
    if (chatbot.username !== req.user.email) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own chatbots'
      });
    }

    // Update fields
    if (title !== undefined) chatbot.title = title;
    if (desc !== undefined) chatbot.desc = desc;
    if (accessMode !== undefined) chatbot.accessMode = accessMode;
    if (language !== undefined) chatbot.language = language;

    await chatbot.save();

    res.json({
      success: true,
      chatbot: {
        chatbotId: chatbot.chatbotId,
        title: chatbot.title,
        desc: chatbot.desc,
        origin: chatbot.origin,
        status: chatbot.status,
        language: chatbot.language,
        subdomain: chatbot.subdomain,
        accessMode: chatbot.accessMode,
        updatedAt: chatbot.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating chatbot:', error);
    res.status(500).json({
      error: 'Failed to update chatbot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete a chatbot
 * DELETE /api/chatbots/:id
 */
export async function deleteChatbot(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found'
      });
    }

    // Verify ownership
    if (chatbot.username !== req.user.email) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own chatbots'
      });
    }

    // Delete from DynamoDB
    await ChatbotModel.delete(id);

    // TODO: Delete associated files from S3
    // TODO: Delete associated data from other tables (customization, query logs, etc.)

    res.json({
      success: true,
      message: 'Chatbot deleted successfully',
      chatbotId: id,
    });
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    res.status(500).json({
      error: 'Failed to delete chatbot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Trigger chatbot rebuild
 * POST /api/chatbots/:id/rebuild
 */
export async function rebuildChatbot(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found'
      });
    }

    // Verify ownership
    if (chatbot.username !== req.user.email) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only rebuild your own chatbots'
      });
    }

    // Update status to BUILDING
    chatbot.status = 'BUILDING';
    chatbot.step = 0;
    chatbot.errorStep = undefined;
    chatbot.errorMessage = undefined;
    chatbot.lastRebuildDateTime = new Date().toISOString();
    await chatbot.save();

    // Send rebuild message to SQS
    try {
      await sendRebuildMessage(id);
    } catch (sqsError) {
      console.error('Error sending rebuild message:', sqsError);
      return res.status(500).json({
        error: 'Failed to queue rebuild job',
        message: sqsError instanceof Error ? sqsError.message : 'Unknown error'
      });
    }

    res.json({
      success: true,
      message: 'Rebuild job queued successfully',
      chatbot: {
        chatbotId: chatbot.chatbotId,
        status: chatbot.status,
        lastRebuildDateTime: chatbot.lastRebuildDateTime,
      },
    });
  } catch (error) {
    console.error('Error rebuilding chatbot:', error);
    res.status(500).json({
      error: 'Failed to rebuild chatbot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get chatbot build status
 * GET /api/chatbots/:id/status
 */
export async function getChatbotStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found'
      });
    }

    // Verify ownership
    if (chatbot.username !== req.user.email) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view status of your own chatbots'
      });
    }

    res.json({
      success: true,
      chatbotId: chatbot.chatbotId,
      status: chatbot.status,
      step: chatbot.step,
      errorStep: chatbot.errorStep,
      errorMessage: chatbot.errorMessage,
      lastRebuildDateTime: chatbot.lastRebuildDateTime,
      updatedAt: chatbot.updatedAt,
    });
  } catch (error) {
    console.error('Error getting chatbot status:', error);
    res.status(500).json({
      error: 'Failed to get chatbot status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
