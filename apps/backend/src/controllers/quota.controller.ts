import { Response } from 'express';
import { UserModel, ChatbotModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorResponse, ErrorCodes } from '../utils/error-response';

// Quota configuration by tier
const TIER_QUOTAS = {
  0: {
    // Free
    chatQuota: 20,
    chatbotQuota: 1,
    storageQuota: 10 * 1024 * 1024, // 10MB
    webPagesQuota: 10,
  },
  1: {
    // Starter
    chatQuota: 1500,
    chatbotQuota: 2,
    storageQuota: 100 * 1024 * 1024, // 100MB
    webPagesQuota: 100,
  },
  2: {
    // Standard
    chatQuota: 7500,
    chatbotQuota: 4,
    storageQuota: 500 * 1024 * 1024, // 500MB
    webPagesQuota: 500,
  },
  3: {
    // Business
    chatQuota: 15000,
    chatbotQuota: 8,
    storageQuota: 2 * 1024 * 1024 * 1024, // 2GB
    webPagesQuota: 2000,
  },
};

/**
 * Get user quota and usage
 * GET /api/quota
 */
export async function getUserQuota(req: AuthRequest, res: Response) {
  try {
    const username = req.user?.email;

    if (!username) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    // Get user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'User not found');
    }

    const user = users[0];
    const tier = user.tier || 0;
    const quotas = TIER_QUOTAS[tier as keyof typeof TIER_QUOTAS] || TIER_QUOTAS[0];

    // Get chatbot count
    const chatbots = await ChatbotModel.query('username').eq(username).exec();

    // Calculate storage usage
    let storageUsage = 0;
    let webPagesUsage = 0;

    chatbots.forEach((chatbot) => {
      storageUsage += chatbot.fileSizeUsage || 0;
      webPagesUsage += chatbot.webCountUsage || 0;
    });

    res.json({
      success: true,
      quota: {
        tier,
        tierName: ['Free', 'Starter', 'Standard', 'Business'][tier] || 'Free',
        chat: {
          quota: quotas.chatQuota,
          usage: user.chat_usage || 0,
          remaining: Math.max(0, quotas.chatQuota - (user.chat_usage || 0)),
          percentage: Math.min(
            100,
            Math.round(((user.chat_usage || 0) / quotas.chatQuota) * 100)
          ),
        },
        chatbot: {
          quota: quotas.chatbotQuota,
          usage: chatbots.length,
          remaining: Math.max(0, quotas.chatbotQuota - chatbots.length),
          percentage: Math.min(
            100,
            Math.round((chatbots.length / quotas.chatbotQuota) * 100)
          ),
        },
        storage: {
          quota: quotas.storageQuota,
          usage: storageUsage,
          remaining: Math.max(0, quotas.storageQuota - storageUsage),
          percentage: Math.min(
            100,
            Math.round((storageUsage / quotas.storageQuota) * 100)
          ),
        },
        webPages: {
          quota: quotas.webPagesQuota,
          usage: webPagesUsage,
          remaining: Math.max(0, quotas.webPagesQuota - webPagesUsage),
          percentage: Math.min(
            100,
            Math.round((webPagesUsage / quotas.webPagesQuota) * 100)
          ),
        },
        resetAt: user.resetAt || 0,
        expireAt: user.expireAt || 0,
      },
    });
  } catch (error) {
    console.error('Error getting user quota:', error);
    res.status(500).json({
      error: 'Failed to get user quota',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Check if chatbot quota is exceeded
 * GET /api/quota/:chatbotId
 */
export async function checkChatbotQuota(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const tier = user.tier || 0;
    const quotas = TIER_QUOTAS[tier as keyof typeof TIER_QUOTAS] || TIER_QUOTAS[0];

    // Get chatbot
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Check quotas
    const chatExceeded = (user.chat_usage || 0) >= quotas.chatQuota;
    const storageExceeded =
      (chatbot.fileSizeUsage || 0) >= quotas.storageQuota;
    const webPagesExceeded =
      (chatbot.webCountUsage || 0) >= quotas.webPagesQuota;

    res.json({
      success: true,
      exceeded: chatExceeded || storageExceeded || webPagesExceeded,
      details: {
        chat: {
          exceeded: chatExceeded,
          usage: user.chat_usage || 0,
          quota: quotas.chatQuota,
        },
        storage: {
          exceeded: storageExceeded,
          usage: chatbot.fileSizeUsage || 0,
          quota: quotas.storageQuota,
        },
        webPages: {
          exceeded: webPagesExceeded,
          usage: chatbot.webCountUsage || 0,
          quota: quotas.webPagesQuota,
        },
      },
    });
  } catch (error) {
    console.error('Error checking chatbot quota:', error);
    res.status(500).json({
      error: 'Failed to check chatbot quota',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get detailed usage statistics
 * GET /api/quota/usage
 */
export async function getUsageStats(req: AuthRequest, res: Response) {
  try {
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get all chatbots
    const chatbots = await ChatbotModel.query('username').eq(username).exec();

    // Calculate usage per chatbot
    const chatbotUsage = chatbots.map((chatbot) => ({
      chatbotId: chatbot.chatbotId,
      title: chatbot.title,
      fileSizeUsage: chatbot.fileSizeUsage || 0,
      webCountUsage: chatbot.webCountUsage || 0,
      status: chatbot.status,
      createdAt: chatbot.createdAt,
    }));

    // Calculate totals
    const totalFileSize = chatbots.reduce(
      (sum, c) => sum + (c.fileSizeUsage || 0),
      0
    );
    const totalWebCount = chatbots.reduce(
      (sum, c) => sum + (c.webCountUsage || 0),
      0
    );

    res.json({
      success: true,
      usage: {
        chatUsage: user.chat_usage || 0,
        chatbotCount: chatbots.length,
        totalFileSize,
        totalWebCount,
        chatbots: chatbotUsage,
      },
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      error: 'Failed to get usage stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get available tiers and their quotas
 * GET /api/quota/tiers
 */
export async function getAvailableTiers(req: AuthRequest, res: Response) {
  try {
    const tiers = [
      {
        tier: 0,
        name: 'Free',
        price: 0,
        interval: 'month',
        quotas: TIER_QUOTAS[0],
      },
      {
        tier: 1,
        name: 'Starter',
        price: 19,
        interval: 'month',
        quotas: TIER_QUOTAS[1],
      },
      {
        tier: 2,
        name: 'Standard',
        price: 99,
        interval: 'month',
        quotas: TIER_QUOTAS[2],
      },
      {
        tier: 3,
        name: 'Business',
        price: 399,
        interval: 'month',
        quotas: TIER_QUOTAS[3],
      },
    ];

    res.json({
      success: true,
      tiers,
    });
  } catch (error) {
    console.error('Error getting available tiers:', error);
    res.status(500).json({
      error: 'Failed to get available tiers',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
