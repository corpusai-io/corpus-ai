import { Response } from 'express';
import {
  ChatbotModel, UserModel, getChatbotById, sendBuildMessage, sendRebuildMessage,
  uploadFileToS3, generatePresignedUploadUrl, getChatbotFilePath,
  deleteFileFromS3,
  // RAG pipeline imports for local dev build
  downloadFileFromS3, listFilesInS3,
  processPDF, processDOCX, processURL, processPlainText, crawlWebsite,
  createParentChildChunks, contextualizeChunks, attachAnnotationsToChunks, sanitizeForId,
  generateEmbeddings, upsertVectors, getOrCreateIndex,
  type ProcessedDocument, type TextChunk,
  // Cleanup imports for chatbot deletion
  deleteChatbotVectors,
  CustomizationModel, QueryLogModel, LeadGenerationModel,
  AccessControlModel, ApiKeyModel, DatabaseConnectionModel,
  ChatHistoryModel,
  dataStore, leadData, leadFields,
  slackIntegration, zapierIntegration, telegramIntegration,
  whatsAppIntegration, googleDriveIntegration,
  getDataStoreRecords,
} from '@corpusai/aws-common';
import { nanoid } from 'nanoid';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorResponse, ErrorCodes } from '../utils/error-response';
import { PRICING_PLANS } from '../config/pricing';

/**
 * Create a new chatbot
 * POST /api/chatbots
 */
export async function createChatbot(req: AuthRequest, res: Response) {
  try {
    const { title, desc, origin, language, files, textContent } = req.body;

    // Get username from authenticated user
    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const username = req.user.email;

    // Validate required fields
    if (!origin) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing required field: origin');
    }

    // Quota enforcement: check chatbot count (skip in local dev)
    if (!process.env.DYNAMODB_ENDPOINT) {
      const users = await UserModel.query('username').eq(username).exec();
      const userTier = users.length > 0 ? (users[0].tier || 0) : 0;
      const plan = PRICING_PLANS.find(p => p.tier === userTier) || PRICING_PLANS[0];
      const existingBots = await ChatbotModel.query('username').eq(username).exec();

      if (existingBots.length >= plan.features.chatbotQuota) {
        return errorResponse(res, 403, ErrorCodes.QUOTA_EXCEEDED,
          `Chatbot limit reached. Your ${plan.name} plan allows ${plan.features.chatbotQuota} chatbot(s). Upgrade to create more.`,
          { current: existingBots.length, limit: plan.features.chatbotQuota, tier: userTier }
        );
      }
    }

    // Generate unique IDs
    const chatbotId = `bot-${nanoid(12)}`;
    const indexName = process.env.PINECONE_INDEX || 'corpus-dense'; // Centralized index, namespace isolation per chatbot
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

    // Handle text content: store in S3 as a text file (aligned with addDataRecord pattern)
    let textS3Key: string | undefined;
    if (origin === 'text-input' && textContent) {
      try {
        const textSourceName = title || 'Initial Content';
        const txtFilename = `${textSourceName.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
        textS3Key = getChatbotFilePath(chatbotId, txtFilename);
        await uploadFileToS3({
          key: textS3Key,
          body: textContent,
          contentType: 'text/plain',
          metadata: { chatbotId, originalFilename: encodeURIComponent(textSourceName) },
        });
        console.log(`Stored text content for chatbot ${chatbotId}`);
      } catch (err) {
        console.error('Failed to store text content:', err);
        textS3Key = undefined;
      }
    }

    // Auto-create data store records for website and text origins
    if (origin.startsWith('http://') || origin.startsWith('https://')) {
      try {
        await dataStore.create({
          username,
          chatbotId,
          dataSource: origin,
          dataType: 'web',
          status: 'processing',
        }).go();
      } catch (err) {
        console.error('Failed to create data store record for website origin:', err);
      }
    } else if (origin === 'text-input' && textContent) {
      try {
        const textSourceName = title || 'Initial Content';
        await dataStore.create({
          username,
          chatbotId,
          dataSource: textSourceName,
          dataType: 'text',
          dataSize: textContent.length,
          ...(textS3Key && { s3Key: textS3Key }),
          status: 'processing',
        }).go();
      } catch (err) {
        console.error('Failed to create data store record for text origin:', err);
      }
    }

    // For file-upload: don't trigger build yet (dashboard will upload files then call rebuild)
    // For website/text: trigger build immediately
    const shouldBuild = origin !== 'file-upload';

    if (shouldBuild) {
      if (process.env.DYNAMODB_ENDPOINT) {
        // Local development: run full RAG pipeline inline (no SQS/Lambda needed)
        console.log(`[Local Dev] Starting local build for chatbot ${chatbotId}`);
        runLocalBuild(chatbotId, username, origin, title || 'Untitled Chatbot', files).catch((err) => {
          console.error(`[Local Build] Failed for ${chatbotId}:`, err.message);
        });
      } else {
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
        }
      }
    } else {
      // File upload source: set status to PENDING, waiting for files
      chatbot.status = 'PENDING' as any;
      chatbot.step = 0;
      await chatbot.save();
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
 * GET /api/chatbots?search=&status=&sort=createdAt&order=desc&limit=50&offset=0
 */
export async function listChatbots(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const username = req.user.email;
    const {
      search,
      status,
      sort = 'createdAt',
      order = 'desc',
      limit = '50',
      offset = '0',
    } = req.query;

    // Query chatbots by username
    const chatbots = await ChatbotModel.query('username').eq(username).exec();

    let filtered = chatbots.map((bot: any) => ({
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
    }));

    // Filter by title search
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((bot: any) =>
        bot.title?.toLowerCase().includes(searchLower) ||
        bot.desc?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (status && typeof status === 'string') {
      filtered = filtered.filter((bot: any) => bot.status === status);
    }

    // Sort
    const sortField = (sort as string) || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    filtered.sort((a: any, b: any) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return aVal > bVal ? sortOrder : aVal < bVal ? -sortOrder : 0;
    });

    // Pagination
    const total = filtered.length;
    const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const offsetNum = Math.max(Number(offset) || 0, 0);
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      count: paginated.length,
      total,
      limit: limitNum,
      offset: offsetNum,
      chatbots: paginated,
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
 * Get limited public chatbot info (for widget embed)
 * GET /api/chatbots/:id/public
 * No authentication required - returns only non-sensitive fields.
 */
export async function getChatbotPublic(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Return only public-safe fields (no username, indexName, API keys, etc.)
    res.json({
      success: true,
      chatbot: {
        chatbotId: chatbot.chatbotId,
        title: chatbot.title,
        status: chatbot.status,
        language: chatbot.language,
      },
    });
  } catch (error) {
    console.error('Error getting public chatbot info:', error);
    res.status(500).json({
      error: 'Failed to get chatbot info',
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

    const chatbotId = id;
    const username = chatbot.username;
    const indexName = chatbot.indexName || process.env.PINECONE_INDEX || 'corpus-dense';

    // Clean up all associated resources in parallel (best-effort).
    // Each task is wrapped in try/catch so failures don't block other cleanup.
    await Promise.all([
      // 1. Delete Pinecone vectors for this chatbot's namespace
      (async () => {
        try {
          await deleteChatbotVectors(indexName, chatbotId);
          console.log(`[Delete] Pinecone vectors deleted for ${chatbotId}`);
        } catch (err) {
          console.error(`[Delete] Failed to delete Pinecone vectors for ${chatbotId}:`, err);
        }
      })(),

      // 2. Delete S3 files under chatbots/{chatbotId}/
      (async () => {
        try {
          const files = await listFilesInS3(`chatbots/${chatbotId}/`);
          if (files.length > 0) {
            await Promise.all(
              files.map((file: { key: string }) => deleteFileFromS3(file.key).catch((e: any) =>
                console.error(`[Delete] Failed to delete S3 file ${file.key}:`, e)
              ))
            );
          }
          console.log(`[Delete] S3 files deleted for ${chatbotId} (${files.length} files)`);
        } catch (err) {
          console.error(`[Delete] Failed to delete S3 files for ${chatbotId}:`, err);
        }
      })(),

      // 3. Delete customization records
      (async () => {
        try {
          const records = await CustomizationModel.query('chatbotId').eq(chatbotId).exec();
          if (records.length > 0) {
            await Promise.all(
              records.map((r: any) => CustomizationModel.delete({ chatbotId, id: r.id }).catch((e: any) =>
                console.error(`[Delete] Failed to delete customization record:`, e)
              ))
            );
          }
          console.log(`[Delete] Customization records deleted for ${chatbotId} (${records.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete customization records for ${chatbotId}:`, err);
        }
      })(),

      // 4. Delete query logs (hashKey is passageIndex which stores chatbotId)
      (async () => {
        try {
          const records = await QueryLogModel.query('passageIndex').eq(chatbotId).exec();
          if (records.length > 0) {
            await Promise.all(
              records.map((r: any) => QueryLogModel.delete({ passageIndex: chatbotId, uniqueTimestamp: r.uniqueTimestamp }).catch((e: any) =>
                console.error(`[Delete] Failed to delete query log record:`, e)
              ))
            );
          }
          console.log(`[Delete] Query logs deleted for ${chatbotId} (${records.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete query logs for ${chatbotId}:`, err);
        }
      })(),

      // 5. Delete lead generation records (Dynamoose model)
      (async () => {
        try {
          const records = await LeadGenerationModel.query('chatbotId').eq(chatbotId).exec();
          if (records.length > 0) {
            await Promise.all(
              records.map((r: any) => LeadGenerationModel.delete({ chatbotId, uniqueTimestamp: r.uniqueTimestamp }).catch((e: any) =>
                console.error(`[Delete] Failed to delete lead generation record:`, e)
              ))
            );
          }
          console.log(`[Delete] Lead generation records deleted for ${chatbotId} (${records.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete lead generation records for ${chatbotId}:`, err);
        }
      })(),

      // 5b. Delete lead data (ElectroDB entity)
      (async () => {
        try {
          const result = await leadData.query.primary({ chatbotId }).go();
          if (result.data.length > 0) {
            await Promise.all(
              result.data.map((r: any) => leadData.delete({ chatbotId, dataId: r.dataId }).go().catch((e: any) =>
                console.error(`[Delete] Failed to delete lead data record:`, e)
              ))
            );
          }
          console.log(`[Delete] Lead data deleted for ${chatbotId} (${result.data.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete lead data for ${chatbotId}:`, err);
        }
      })(),

      // 5c. Delete lead fields (ElectroDB entity)
      (async () => {
        try {
          const result = await leadFields.query.primary({ chatbotId }).go();
          if (result.data.length > 0) {
            await Promise.all(
              result.data.map((r: any) => leadFields.delete({ chatbotId, fieldsId: r.fieldsId }).go().catch((e: any) =>
                console.error(`[Delete] Failed to delete lead fields record:`, e)
              ))
            );
          }
          console.log(`[Delete] Lead fields deleted for ${chatbotId} (${result.data.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete lead fields for ${chatbotId}:`, err);
        }
      })(),

      // 6. Delete access control records
      (async () => {
        try {
          const records = await AccessControlModel.query('chatbotId').eq(chatbotId).exec();
          if (records.length > 0) {
            await Promise.all(
              records.map((r: any) => AccessControlModel.delete({ chatbotId, email: r.email }).catch((e: any) =>
                console.error(`[Delete] Failed to delete access control record:`, e)
              ))
            );
          }
          console.log(`[Delete] Access control records deleted for ${chatbotId} (${records.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete access control records for ${chatbotId}:`, err);
        }
      })(),

      // 7. Delete data store records (ElectroDB, composite key: username + chatbotId)
      (async () => {
        try {
          const result = await dataStore.query.primary({ username, chatbotId }).go();
          if (result.data.length > 0) {
            await Promise.all(
              result.data.map((r: any) => dataStore.delete({ username, chatbotId, dataSource: r.dataSource }).go().catch((e: any) =>
                console.error(`[Delete] Failed to delete data store record:`, e)
              ))
            );
          }
          console.log(`[Delete] Data store records deleted for ${chatbotId} (${result.data.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete data store records for ${chatbotId}:`, err);
        }
      })(),

      // 8. Delete API keys
      (async () => {
        try {
          const records = await ApiKeyModel.query('chatbotId').eq(chatbotId).exec();
          if (records.length > 0) {
            await Promise.all(
              records.map((r: any) => ApiKeyModel.delete({ chatbotId, keyId: r.keyId }).catch((e: any) =>
                console.error(`[Delete] Failed to delete API key record:`, e)
              ))
            );
          }
          console.log(`[Delete] API keys deleted for ${chatbotId} (${records.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete API keys for ${chatbotId}:`, err);
        }
      })(),

      // 9. Delete database connections (uses GSI, hashKey is `id`)
      (async () => {
        try {
          const records = await DatabaseConnectionModel.query('chatbotId').using('chatbotId-index').eq(chatbotId).exec();
          if (records.length > 0) {
            await Promise.all(
              records.map((r: any) => DatabaseConnectionModel.delete({ id: r.id }).catch((e: any) =>
                console.error(`[Delete] Failed to delete database connection:`, e)
              ))
            );
          }
          console.log(`[Delete] Database connections deleted for ${chatbotId} (${records.length})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete database connections for ${chatbotId}:`, err);
        }
      })(),

      // 10. Delete chat history records
      (async () => {
        try {
          let cursor: any = undefined;
          let count = 0;
          do {
            const records = await ChatHistoryModel.query('chatbotId').eq(chatbotId).startAt(cursor).limit(100).exec();
            cursor = records.lastKey;
            if (records.length > 0) {
              await Promise.all(
                records.map((r: any) => ChatHistoryModel.delete({ chatbotId, messageId: r.messageId }).catch((e: any) =>
                  console.error(`[Delete] Failed to delete chat history record:`, e)
                ))
              );
              count += records.length;
            }
          } while (cursor !== undefined);
          console.log(`[Delete] Chat history deleted for ${chatbotId} (${count})`);
        } catch (err) {
          console.error(`[Delete] Failed to delete chat history for ${chatbotId}:`, err);
        }
      })(),

      // 11. Delete integration records (ElectroDB entities keyed by chatbotId)
      (async () => {
        try {
          // Slack
          try {
            const result = await slackIntegration.query.primary({ chatbotId }).go();
            await Promise.all(result.data.map((r: any) => slackIntegration.delete({ chatbotId }).go().catch(() => {})));
          } catch (e) { /* no records */ }

          // Zapier
          try {
            const result = await zapierIntegration.query.primary({ chatbotId }).go();
            await Promise.all(result.data.map((r: any) => zapierIntegration.delete({ chatbotId, hookType: r.hookType }).go().catch(() => {})));
          } catch (e) { /* no records */ }

          // Telegram
          try {
            const result = await telegramIntegration.query.primary({ chatbotId }).go();
            await Promise.all(result.data.map((r: any) => telegramIntegration.delete({ chatbotId }).go().catch(() => {})));
          } catch (e) { /* no records */ }

          // WhatsApp
          try {
            const result = await whatsAppIntegration.query.primary({ chatbotId }).go();
            await Promise.all(result.data.map((r: any) => whatsAppIntegration.delete({ chatbotId, phoneNumberId: r.phoneNumberId }).go().catch(() => {})));
          } catch (e) { /* no records */ }

          // Google Drive
          try {
            const result = await googleDriveIntegration.query.primary({ chatbotId }).go();
            await Promise.all(result.data.map((r: any) => googleDriveIntegration.delete({ chatbotId }).go().catch(() => {})));
          } catch (e) { /* no records */ }

          console.log(`[Delete] Integration records deleted for ${chatbotId}`);
        } catch (err) {
          console.error(`[Delete] Failed to delete integration records for ${chatbotId}:`, err);
        }
      })(),
    ]);

    // Delete the chatbot record itself LAST
    await ChatbotModel.delete(chatbotId);
    console.log(`[Delete] Chatbot record deleted: ${chatbotId}`);

    res.json({
      success: true,
      message: 'Chatbot and all associated resources deleted successfully',
      chatbotId,
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

    // Build lock: if already building, skip — the new data source records are
    // already saved with status='processing' and will be picked up automatically
    // when the current build finishes.
    if (chatbot.status === 'BUILDING') {
      console.log(`[Build Lock] Chatbot ${id} is already building — new sources will be processed after current build`);
      return res.json({
        success: true,
        message: 'Build already in progress. New data sources will be processed automatically when the current build finishes.',
        chatbot: {
          chatbotId: chatbot.chatbotId,
          status: chatbot.status,
          lastRebuildDateTime: chatbot.lastRebuildDateTime,
        },
      });
    }

    // Update status to BUILDING
    chatbot.status = 'BUILDING';
    chatbot.step = 0;
    chatbot.errorStep = undefined;
    chatbot.errorMessage = undefined;
    chatbot.lastRebuildDateTime = new Date().toISOString();
    await chatbot.save();

    // Send rebuild message to SQS (or run locally)
    if (process.env.DYNAMODB_ENDPOINT) {
      // Local development: run full RAG pipeline inline
      console.log(`[Local Dev] Starting local rebuild for chatbot ${id}`);
      runLocalBuild(id, req.user.email, chatbot.origin, chatbot.title || 'Untitled Chatbot').catch((err) => {
        console.error(`[Local Build] Rebuild failed for ${id}:`, err.message);
      });
    } else {
      try {
        await sendRebuildMessage(id);
      } catch (sqsError) {
        console.error('Error sending rebuild message:', sqsError);
        return res.status(500).json({
          error: 'Failed to queue rebuild job',
          message: sqsError instanceof Error ? sqsError.message : 'Unknown error'
        });
      }
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
 * Force-activate a chatbot (local dev only)
 * POST /api/chatbots/:id/activate
 */
export async function activateChatbot(req: AuthRequest, res: Response) {
  try {
    if (!process.env.DYNAMODB_ENDPOINT) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Only available in local development');
    }

    const { id } = req.params;
    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const chatbot = await getChatbotById(id);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }
    if (chatbot.username !== req.user.email) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');
    }

    chatbot.status = 'ACTIVE';
    chatbot.step = 3;
    chatbot.errorStep = undefined;
    chatbot.errorMessage = undefined;
    await chatbot.save();

    res.json({
      success: true,
      chatbot: { chatbotId: chatbot.chatbotId, status: chatbot.status },
    });
  } catch (error) {
    console.error('Error activating chatbot:', error);
    res.status(500).json({ error: 'Failed to activate chatbot' });
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
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }

    if (chatbot.username !== req.user.email) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'You can only view status of your own chatbots');
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

/**
 * Stream chatbot build status as Server-Sent Events
 * GET /api/chatbots/:id/status/stream
 */
export async function streamChatbotStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;

  if (!req.user) {
    return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
  }

  // Initial ownership check
  const chatbot = await getChatbotById(id);
  if (!chatbot) {
    return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
  }
  if (chatbot.username !== req.user.email) {
    return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'You can only view status of your own chatbots');
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Send initial status
  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({
    step: chatbot.step,
    status: chatbot.status,
    errorMessage: chatbot.errorMessage || null,
  });

  // If already in terminal state, close immediately
  if (chatbot.status === 'ACTIVE' || chatbot.status === 'ERROR') {
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  let lastStep = chatbot.step;
  let lastStatus = chatbot.status;
  let pollCount = 0;
  const MAX_POLLS = 150; // 5 minutes at 2s intervals

  const pollInterval = setInterval(async () => {
    pollCount++;

    try {
      const updated = await getChatbotById(id);
      if (!updated) {
        sendEvent({ step: -1, status: 'ERROR', errorMessage: 'Chatbot not found' });
        clearInterval(pollInterval);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Only send event if something changed
      if (updated.step !== lastStep || updated.status !== lastStatus) {
        lastStep = updated.step;
        lastStatus = updated.status;

        sendEvent({
          step: updated.step,
          status: updated.status,
          errorMessage: updated.errorMessage || null,
        });
      }

      // Close stream on terminal states or timeout
      if (updated.status === 'ACTIVE' || updated.status === 'ERROR' || pollCount >= MAX_POLLS) {
        clearInterval(pollInterval);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (err) {
      console.error('Error polling chatbot status:', err);
      sendEvent({ step: -1, status: 'ERROR', errorMessage: 'Failed to check status' });
      clearInterval(pollInterval);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }, 2000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(pollInterval);
  });
}

/**
 * Generate presigned upload URLs for chatbot files
 * POST /api/chatbots/:id/upload-url
 */
export async function getUploadUrl(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { filename, contentType } = req.body;

    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    if (!filename || !contentType) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing required fields: filename, contentType');
    }

    const chatbot = await getChatbotById(id);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }
    if (chatbot.username !== req.user.email) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');
    }

    const fileId = nanoid();
    const ext = filename.split('.').pop();
    const fileKey = getChatbotFilePath(id, `${fileId}.${ext}`);

    const uploadUrl = await generatePresignedUploadUrl(fileKey, contentType, {
      chatbotId: id,
      originalFilename: encodeURIComponent(filename),
    });

    res.json({
      success: true,
      uploadUrl,
      fileKey,
      fileId,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({
      error: 'Failed to generate upload URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Upload a file for a chatbot via the backend (server-side S3 upload).
 * POST /api/chatbots/:id/upload  (multipart/form-data, field name: "file")
 */
export async function uploadFile(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'No file provided');
    }

    const chatbot = await getChatbotById(id);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }
    if (chatbot.username !== req.user.email) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');
    }

    const fileId = nanoid();
    const ext = file.originalname.split('.').pop();
    const fileKey = getChatbotFilePath(id, `${fileId}.${ext}`);

    await uploadFileToS3({
      key: fileKey,
      body: file.buffer,
      contentType: file.mimetype,
      metadata: {
        chatbotId: id,
        originalFilename: encodeURIComponent(file.originalname),
      },
    });

    res.json({
      success: true,
      fileKey,
      fileId,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Start build after files are uploaded
 * POST /api/chatbots/:id/build
 */
export async function startBuild(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { fileKeys, fileMeta } = req.body;

    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const chatbot = await getChatbotById(id);
    if (!chatbot) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
    }
    if (chatbot.username !== req.user.email) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');
    }

    // Build lock: if already building, create data store records but don't start
    // a new build — the records will be picked up after the current build finishes.
    const isLocked = chatbot.status === 'BUILDING';
    if (isLocked) {
      console.log(`[Build Lock] Chatbot ${id} is already building — saving file records for post-build processing`);
    }

    if (!isLocked) {
      // Update status to BUILDING
      chatbot.status = 'BUILDING';
      chatbot.step = 0;
      chatbot.errorStep = undefined;
      chatbot.errorMessage = undefined;
      chatbot.lastRebuildDateTime = new Date().toISOString();
      await chatbot.save();
    }

    // Create data store records for each file being built
    if (fileKeys && fileKeys.length > 0) {
      const username = req.user.email;
      const indexName = process.env.PINECONE_INDEX || 'corpus-dense';

      for (let index = 0; index < fileKeys.length; index++) {
        const key = fileKeys[index];
        const meta = fileMeta?.[index];
        const originalName = meta?.name || key.split('/').pop() || key;
        const fileSize = meta?.size || 0;

        // Check if a record with the same name already exists (file re-upload)
        try {
          const existing = await dataStore.get({ username, chatbotId: id, dataSource: originalName }).go();
          if (existing.data) {
            console.log(`[startBuild] Replacing existing file "${originalName}" for chatbot ${id}`);

            // Delete old S3 file if it has a different key
            if (existing.data.s3Key && existing.data.s3Key !== key) {
              try {
                await deleteFileFromS3(existing.data.s3Key);
                console.log(`[startBuild] Deleted old S3 file: ${existing.data.s3Key}`);
              } catch (e: any) {
                console.warn(`[startBuild] Could not delete old S3 file: ${e.message}`);
              }
            }

            // Clean up old Pinecone vectors for this source
            try {
              const idx = await getOrCreateIndex(indexName);
              const ns = idx.namespace(id);
              const listResult = await ns.listPaginated({ prefix: `${originalName}-` });
              const vectorIds = (listResult.vectors || []).map((v: any) => v.id);
              if (vectorIds.length > 0) {
                await ns.deleteMany(vectorIds);
                console.log(`[startBuild] Cleaned up ${vectorIds.length} old vectors for "${originalName}"`);
              }
            } catch (e: any) {
              console.warn(`[startBuild] Could not clean up old vectors: ${e.message}`);
            }
          }
        } catch (e) { /* record doesn't exist — first upload */ }

        // Create or replace the data store record
        try {
          await dataStore.put({
            username,
            chatbotId: id,
            dataSource: originalName,
            dataType: 'file',
            dataSize: fileSize,
            s3Key: key,
            status: 'processing',
          }).go();
        } catch (err: any) {
          console.error(`Failed to create data store record for ${originalName}:`, err);
        }
      }
    }

    // If build is locked, just return — records are saved and will be picked up
    if (isLocked) {
      return res.json({
        success: true,
        message: 'Build already in progress. New files will be processed automatically when the current build finishes.',
        chatbot: {
          chatbotId: chatbot.chatbotId,
          status: chatbot.status,
        },
      });
    }

    // Send build message to SQS (or run locally)
    if (process.env.DYNAMODB_ENDPOINT) {
      // Local development: run full RAG pipeline inline
      console.log(`[Local Dev] Starting local build for chatbot ${id}`);
      runLocalBuild(id, req.user.email, chatbot.origin, chatbot.title || 'Untitled Chatbot', fileKeys, fileMeta).catch((err) => {
        console.error(`[Local Build] Failed for ${id}:`, err.message);
      });
    } else {
      try {
        await sendBuildMessage({
          chatbotId: id,
          username: req.user.email,
          origin: chatbot.origin,
          indexName: chatbot.indexName,
          language: chatbot.language || 'en',
          files: fileKeys || [],
        });
      } catch (sqsError) {
        console.error('Error sending build message:', sqsError);
        return res.status(500).json({
          error: 'Failed to queue build job',
          message: sqsError instanceof Error ? sqsError.message : 'Unknown error',
        });
      }
    }

    res.json({
      success: true,
      message: 'Build started',
      chatbot: {
        chatbotId: chatbot.chatbotId,
        status: chatbot.status,
      },
    });
  } catch (error) {
    console.error('Error starting build:', error);
    res.status(500).json({
      error: 'Failed to start build',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ─── Local Dev Build Pipeline ────────────────────────────────────────

/**
 * Run the full RAG build pipeline locally (dev only)
 * POST /api/chatbots/:id/local-build
 */
export async function localBuild(req: AuthRequest, res: Response) {
  if (!process.env.DYNAMODB_ENDPOINT) {
    return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Only available in local development');
  }

  const { id } = req.params;
  const { fileKeys } = req.body;

  if (!req.user) {
    return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
  }

  const chatbot = await getChatbotById(id);
  if (!chatbot) {
    return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Chatbot not found');
  }
  if (chatbot.username !== req.user.email) {
    return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');
  }

  // Respond immediately, run build in background
  res.json({ success: true, message: 'Local build started in background' });

  // Run the pipeline asynchronously
  runLocalBuild(id, req.user.email, chatbot.origin, chatbot.title || 'Untitled Chatbot', fileKeys).catch((err) => {
    console.error(`[Local Build] Failed for ${id}:`, err.message);
  });
}

/**
 * Core build pipeline — same logic as Lambda handler
 */
async function runLocalBuild(
  chatbotId: string,
  username: string,
  origin: string,
  title: string,
  fileKeys?: string[],
  fileMeta?: Array<{ name: string; size: number }>
) {
  const updateStatus = async (status: string, step: number, message: string) => {
    try {
      await ChatbotModel.update({ chatbotId }, { status, step, lastRebuildDateTime: new Date().toISOString(), errorMessage: message });
      console.log(`[Local Build] ${chatbotId} → Step ${step}: ${message}`);
    } catch (e) { /* ignore status update failures */ }
  };

  try {
    // Step 1: Initialize
    await updateStatus('BUILDING', 1, 'Initializing build...');

    // Step 2: Download/collect documents
    await updateStatus('BUILDING', 2, 'Downloading files...');
    const documents = await collectDocuments(chatbotId, origin, fileKeys, username, fileMeta);
    const processedSources = new Set<string>();
    console.log(`[Local Build] Collected ${documents.length} documents`);

    if (documents.length === 0) {
      throw new Error('No documents found to process');
    }

    // Step 3: Process documents into chunks
    await updateStatus('BUILDING', 3, 'Processing documents...');
    const allChildChunks: TextChunk[] = [];
    const allParentChunks: TextChunk[] = [];

    for (const doc of documents) {
      try {
        let processed: ProcessedDocument;
        switch (doc.type) {
          case 'pdf':
            processed = await processPDF(doc.content as Buffer, doc.source);
            break;
          case 'docx':
            processed = await processDOCX(doc.content as Buffer, doc.source);
            break;
          case 'url':
            processed = await processURL(doc.content as string);
            break;
          default:
            processed = processPlainText(
              Buffer.isBuffer(doc.content) ? doc.content.toString('utf-8') : doc.content,
              doc.source
            );
        }

        const { parentChunks, childChunks } = createParentChildChunks(processed.text, doc.source, {
          parentChunkSize: 2000, parentChunkOverlap: 200,
          childChunkSize: 400, childChunkOverlap: 50,
          documentId: `${chatbotId}-${sanitizeForId(doc.source)}`,
          documentTitle: processed.metadata.title || doc.source,
        });

        let annotatedChildChunks = childChunks;
        if (processed.pageExtractions && processed.pageExtractions.length > 0) {
          annotatedChildChunks = attachAnnotationsToChunks(childChunks, processed.pageExtractions);
        }

        allChildChunks.push(...annotatedChildChunks);
        allParentChunks.push(...parentChunks);

        // Update pageCount on the data store record
        if (doc.type === 'pdf' || doc.type === 'docx') {
          try {
            // PDF has exact pages; DOCX estimate ~250 words/page
            const pages = processed.metadata.pages || Math.max(1, Math.ceil(processed.metadata.wordCount / 250));
            await dataStore.patch({ username, chatbotId, dataSource: doc.source })
              .set({ pageCount: pages })
              .go();
            console.log(`[Local Build] Updated pageCount=${pages} for ${doc.source}`);
          } catch (e: any) {
            console.warn(`[Local Build] Failed to update pageCount for ${doc.source}:`, e.message);
          }
        }

        processedSources.add(doc.source);
        console.log(`[Local Build] Processed ${doc.source}: ${parentChunks.length} parent, ${childChunks.length} child chunks`);
      } catch (err: any) {
        console.error(`[Local Build] Error processing ${doc.source}:`, err.message);
      }
    }

    if (allChildChunks.length === 0) {
      throw new Error('No chunks created from documents');
    }

    // Step 4: Contextual enrichment
    await updateStatus('BUILDING', 4, 'Adding contextual enrichment...');
    let enrichedChunks = allChildChunks;
    try {
      enrichedChunks = await contextualizeChunks(allChildChunks, title || 'Document');
      console.log(`[Local Build] Contextualized ${enrichedChunks.length} chunks`);
    } catch (err: any) {
      console.warn('[Local Build] Contextual enrichment failed, using raw chunks:', err.message);
    }

    // Step 5: Generate embeddings
    await updateStatus('BUILDING', 5, `Generating embeddings for ${enrichedChunks.length} chunks...`);
    const texts = enrichedChunks.map(c => c.text);
    const embeddings = await generateEmbeddings(texts);
    console.log(`[Local Build] Generated ${embeddings.length} embeddings`);

    // Step 6: Store in Pinecone
    await updateStatus('BUILDING', 6, 'Storing vectors...');
    const indexName = process.env.PINECONE_INDEX || 'corpus-dense';
    await getOrCreateIndex(indexName, 3072);

    const vectors = enrichedChunks.map((chunk, i) => ({
      id: chunk.id,
      values: embeddings[i],
      metadata: {
        text: chunk.text,
        chatbotId,
        username,
        source: chunk.metadata.source,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
        chunkType: chunk.metadata.chunkType || 'standard',
        parentChunkId: chunk.metadata.parentChunkId,
        documentId: chunk.metadata.documentId,
        documentTitle: chunk.metadata.documentTitle,
        pageNumber: chunk.metadata.pageNumber,
        annotations: chunk.metadata.annotations,
        contextPrefix: chunk.metadata.contextPrefix,
      },
    }));

    await upsertVectors(indexName, vectors, chatbotId);
    console.log(`[Local Build] Upserted ${vectors.length} vectors to namespace ${chatbotId}`);

    // Parent chunks are stored as metadata references on child chunks (via parentChunkId).
    // They don't need their own vectors since they're never retrieved via similarity search.
    console.log(`[Local Build] ${allParentChunks.length} parent chunks linked via child metadata`);

    // Update only processed dataStore records to active
    try {
      const records = await getDataStoreRecords(username, chatbotId);
      const toUpdate = records.filter((r) => processedSources.has(r.dataSource));
      await Promise.all(
        toUpdate.map((r) =>
          dataStore.patch({ username, chatbotId, dataSource: r.dataSource })
            .set({ status: 'active' })
            .go()
            .catch((e: any) => console.error(`Failed to update dataStore status for ${r.dataSource}:`, e))
        )
      );
      console.log(`[Local Build] Updated ${toUpdate.length} of ${records.length} data store records to active`);

      // Auto-retry: check if new data sources were added during this build
      const pendingRecords = records.filter(
        (r) => r.status === 'processing' && !processedSources.has(r.dataSource)
      );
      if (pendingRecords.length > 0) {
        console.log(`[Build Lock] Found ${pendingRecords.length} pending data sources added during build — auto-triggering next build`);
        const freshChatbot = await getChatbotById(chatbotId);
        if (freshChatbot) {
          runLocalBuild(chatbotId, username, freshChatbot.origin, freshChatbot.title || 'Untitled Chatbot').catch((err) => {
            console.error(`[Local Build] Auto-retry failed for ${chatbotId}:`, err.message);
          });
          return; // Stay BUILDING — the next build will set ACTIVE when done
        }
      }
    } catch (e: any) {
      console.error('[Local Build] Failed to update data store statuses:', e.message);
    }

    // Step 7: All done — no pending sources remain
    await updateStatus('ACTIVE', 7, 'Build completed successfully!');
    console.log(`[Local Build] ✓ Build completed for ${chatbotId}`);

  } catch (error: any) {
    console.error(`[Local Build] Build failed for ${chatbotId}:`, error.message);
    await updateStatus('ERROR', 0, error.message).catch(() => {});
  }
}

/**
 * Collect documents for processing.
 * Uses data store records to determine what needs processing,
 * regardless of the chatbot's original origin (file-upload, URL, text-input).
 */
async function collectDocuments(
  chatbotId: string,
  origin: string,
  fileKeys?: string[],
  username?: string,
  fileMeta?: Array<{ name: string; size: number }>
): Promise<Array<{ source: string; content: string | Buffer; type: 'pdf' | 'url' | 'text' | 'docx' | 'csv' | 'xlsx' }>> {
  const docs: Array<{ source: string; content: string | Buffer; type: 'pdf' | 'url' | 'text' | 'docx' | 'csv' | 'xlsx' }> = [];

  // When explicit fileKeys are provided (initial file upload), process only those
  if (fileKeys && fileKeys.length > 0) {
    for (let i = 0; i < fileKeys.length; i++) {
      const key = fileKeys[i];
      try {
        const content = await downloadFileFromS3(key);
        const name = fileMeta?.[i]?.name || key.split('/').pop() || key;
        docs.push({ source: name, content, type: detectType(name) });
      } catch (e: any) {
        console.error(`[Local Build] Failed to download ${key}:`, e.message);
      }
    }
    return docs;
  }

  // Query all data store records for this chatbot
  let allRecords: Awaited<ReturnType<typeof getDataStoreRecords>> = [];
  if (username) {
    try {
      allRecords = await getDataStoreRecords(username, chatbotId);
    } catch (e) { /* ignore */ }
  }

  const isRebuild = !fileKeys || fileKeys.length === 0;

  // --- Process web-type data sources with status='processing' ---
  const webRecordsToProcess = allRecords.filter(r => r.dataType === 'web' && r.status === 'processing');
  if (webRecordsToProcess.length > 0) {
    let userTier = 0;
    if (username) {
      try {
        const users = await UserModel.query('username').eq(username).exec();
        if (users.length > 0) userTier = users[0].tier || 0;
      } catch (e) { /* default to free tier */ }
    }

    const tierPageLimits: Record<number, number> = { 0: 10, 1: 100, 2: 500, 3: 2000 };
    const maxPages = tierPageLimits[userTier] || 10;

    for (const webRecord of webRecordsToProcess) {
      const webUrl = webRecord.dataSource;
      console.log(`[Local Build] Crawling ${webUrl} (max ${maxPages} pages, tier ${userTier})`);

      try {
        const crawledDocs = await crawlWebsite(webUrl, maxPages);
        console.log(`[Local Build] Firecrawl returned ${crawledDocs.length} pages`);

        for (const doc of crawledDocs) {
          docs.push({ source: doc.source, content: doc.text, type: 'text' });
        }

        if (username) {
          try {
            await dataStore.patch({ username, chatbotId, dataSource: webUrl })
              .set({ crawledPages: crawledDocs.length })
              .go();
            console.log(`[Local Build] Updated crawledPages=${crawledDocs.length} for ${webUrl}`);
          } catch (e: any) {
            console.warn(`[Local Build] Failed to update crawledPages:`, e.message);
          }
        }
      } catch (err: any) {
        console.error(`[Local Build] Crawl failed for ${webUrl}:`, err.message);
        docs.push({ source: webUrl, content: webUrl, type: 'url' });
      }
    }

    // Update the chatbot's webCountUsage
    try {
      const webDocCount = docs.filter(d => d.type === 'text' || d.type === 'url').length;
      await ChatbotModel.update({ chatbotId }, { webCountUsage: webDocCount });
    } catch (e) { /* ignore */ }
  }

  // --- Process S3 file-type data sources ---
  try {
    const s3KeyToName = new Map<string, string>();
    const processingS3Keys = new Set<string>();
    for (const r of allRecords) {
      if (r.s3Key) {
        s3KeyToName.set(r.s3Key, r.dataSource);
        const s3Filename = r.s3Key.split('/').pop();
        if (s3Filename) s3KeyToName.set(s3Filename, r.dataSource);
        if (r.status === 'processing') processingS3Keys.add(r.s3Key);
      }
    }

    const files = await listFilesInS3(`chatbots/${chatbotId}/files/`);
    for (const file of files) {
      // On rebuild, only process files whose data store record is 'processing'
      if (isRebuild && !processingS3Keys.has(file.key)) {
        continue;
      }
      try {
        const content = await downloadFileFromS3(file.key);
        const name = s3KeyToName.get(file.key)
          || s3KeyToName.get(file.key.split('/').pop() || '')
          || file.key.split('/').pop() || file.key;
        docs.push({ source: name, content, type: detectType(name) });
      } catch (e: any) {
        console.error(`[Local Build] Failed to download ${file.key}:`, e.message);
      }
    }
  } catch (e: any) {
    console.error('[Local Build] Failed to list S3 files:', e.message);
  }

  // Fallback for non-URL, non-file origins (plain text stored as origin)
  const reserved = ['file-upload', 'text-input'];
  if (docs.length === 0 && origin && !reserved.includes(origin)) {
    docs.push({ source: 'inline-content', content: origin, type: 'text' });
  }

  return docs;
}

function detectType(name: string): 'pdf' | 'docx' | 'csv' | 'xlsx' | 'text' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'docx';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  return 'text';
}
