// dotenv/config is preloaded via -r flag in dev script (see package.json)
// This ensures process.env is populated BEFORE any import executes.
console.log('[backend] index.ts loaded — build 2026-05-14-001');
import express from 'express';
import path from 'path';
import cors from 'cors';
import dynamoose from 'dynamoose';
import multer from 'multer';
import { uploadFileToS3, getRawFilePath, sendBuildMessage, getQueueStats, checkS3Connectivity, ChatbotModel } from '@corpusai/aws-common';

// Import routes
import authRoutes from './routes/auth.routes';
import chatbotRoutes from './routes/chatbots.routes';
import customizeRoutes from './routes/customize.routes';
import datastoreRoutes from './routes/datastore.routes';
import leadsRoutes from './routes/leads.routes';
import querylogRoutes from './routes/querylog.routes';
import accessRoutes from './routes/access.routes';
import integrationsRoutes from './routes/integrations.routes';
import userRoutes from './routes/user.routes';
import quotaRoutes from './routes/quota.routes';
import paymentRoutes from './routes/payment.routes';
import databaseRoutes from './routes/database.routes';
import aiActionsRoutes from './routes/ai-actions.routes';
import builtinIntegrationsRoutes from './routes/builtin-integrations.routes';

// Import chat proxy controller (local dev)
import { chatProxy, getChatHistory, clearChatHistory, updateChatFeedback } from './controllers/chat.controller';

// Import middleware
import { errorHandler } from './middleware/validation.middleware';
import { authenticateToken, authenticateChat } from './middleware/auth.middleware';
import { AppError, errorResponse, ErrorCodes } from './utils/error-response';
import { ensureLocalTables } from './utils/ensure-local-tables';

// Configure DynamoDB connection
if (process.env.DYNAMODB_ENDPOINT) {
  console.log(`Connecting to DynamoDB Local at ${process.env.DYNAMODB_ENDPOINT}`);
  dynamoose.aws.ddb.local(process.env.DYNAMODB_ENDPOINT);
} else {
  console.log(`Connecting to AWS DynamoDB in region ${process.env.AWS_REGION || 'eu-north-1'}`);
  // Tables are managed by Terraform in staging/prod — disable auto-create/update
  dynamoose.Table.defaults.set({ create: false, update: false, waitForActive: false });
}

const app = express();
const port = process.env.PORT || 8001;

// Trust the upstream proxy (Railway / Nginx) so req.ip resolves to the
// original client IP rather than the proxy's address. Required for
// IP-based rate limiting and for accurate access logs.
app.set('trust proxy', 1);

// CORS configuration for credentials
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:8080,http://localhost:9000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Special handling for Stripe webhook - needs raw body
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Serve widget.js as a static file (public, no CORS restriction)
app.get('/api/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

// Request logger — every request shows method, path, status, duration, and user
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const user = (req as any).user?.email || 'anon';
    const authHint = req.headers.authorization ? `token:${req.headers.authorization.substring(7, 17)}…` : 'no-token';
    if (req.method !== 'OPTIONS') {
      console.log(`[req] ${req.method} ${req.path} → ${res.statusCode} ${ms}ms [${user}] [${authHint}]`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chatbots', chatbotRoutes);
app.use('/api/customize', customizeRoutes);
app.use('/api/data-store', datastoreRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/query-log', querylogRoutes);
app.use('/api/access-control', accessRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quota', quotaRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/databases', databaseRoutes);
app.use('/api/ai-actions', aiActionsRoutes);
app.use('/api/builtin-integrations', builtinIntegrationsRoutes);

// Chat proxy (local dev - replaces Lambda chat_service)
// authenticateChat validates API keys and Cognito JWTs; allows unauthenticated
// requests through for public widget embeds (req.user will be undefined).
app.post('/api/chat', authenticateChat, chatProxy);

// Chat history routes (require auth)
app.get('/api/chat/history/:chatbotId', authenticateToken, getChatHistory);
app.delete('/api/chat/history/:chatbotId', authenticateToken, clearChatHistory);
app.put('/api/chat/history/:chatbotId/:messageId/feedback', authenticateToken, updateChatFeedback);

// Health check routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    dynamodb: process.env.DYNAMODB_ENDPOINT ? 'local' : 'aws',
    region: process.env.AWS_REGION || 'eu-north-1'
  });
});

// Real DynamoDB connectivity check — issues a bounded query so we know
// the runtime user can talk to DynamoDB and read the chatbots table.
app.get('/health/db', async (req, res) => {
  try {
    await ChatbotModel.query('chatbotId').eq('__healthcheck__').limit(1).exec();
    res.json({
      status: 'ok',
      message: 'DynamoDB reachable',
      endpoint: process.env.DYNAMODB_ENDPOINT || 'AWS',
      tables: {
        chatbot: process.env.AWS_DYNAMO_CHATBOT_TABLE,
        user: process.env.AWS_DYNAMO_USER_TABLE,
        customization: process.env.AWS_DYNAMO_CUSTOMIZATION_TABLE,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Real S3 connectivity check — HeadBucket against the configured bucket.
app.get('/health/s3', async (req, res) => {
  try {
    const { bucket } = await checkS3Connectivity();
    res.json({
      status: 'ok',
      message: 'S3 reachable',
      bucket,
      region: process.env.S3_REGION,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      bucket: process.env.S3_BUCKET_NAME,
    });
  }
});

// Test endpoint for SQS connection
app.get('/health/sqs', async (req, res) => {
  try {
    const stats = await getQueueStats();
    res.json({
      status: 'ok',
      message: 'SQS connection configured',
      queueUrl: process.env.SQS_BUILD_QUEUE_URL,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// File upload endpoint
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { chatbotId, username } = req.body;

    if (!files || files.length === 0) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'No files uploaded');
    }

    if (!chatbotId || !username) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing chatbotId or username');
    }

    // Quota enforcement: check storage usage
    const { UserModel, ChatbotModel: CBModel } = await import('@corpusai/aws-common');
    const { PRICING_PLANS: plans } = await import('./config/pricing');
    const users = await UserModel.query('username').eq(username).exec();
    if (users.length > 0) {
      const userTier = users[0].tier || 0;
      const plan = plans.find((p: any) => p.tier === userTier) || plans[0];
      const chatbots = await CBModel.query('username').eq(username).exec();
      let totalStorage = 0;
      chatbots.forEach((bot: any) => { totalStorage += bot.fileSizeUsage || 0; });
      const uploadSize = files.reduce((sum, f) => sum + f.size, 0);

      if (totalStorage + uploadSize > plan.features.storageQuota) {
        return errorResponse(res, 403, ErrorCodes.QUOTA_EXCEEDED,
          `Storage limit exceeded. Your ${plan.name} plan allows ${(plan.features.storageQuota / (1024 * 1024)).toFixed(0)}MB.`,
          { current: totalStorage, uploadSize, limit: plan.features.storageQuota }
        );
      }
    }

    // Upload each file to S3
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const s3Key = getRawFilePath(chatbotId, file.originalname);
        const result = await uploadFileToS3({
          key: s3Key,
          body: file.buffer,
          contentType: file.mimetype,
          metadata: {
            originalname: file.originalname,
            size: file.size.toString(),
            chatbotId,
            username,
          },
        });

        return {
          originalName: file.originalname,
          s3Key: result.key,
          url: result.url,
          size: file.size,
          contentType: file.mimetype,
        };
      })
    );

    res.json({
      success: true,
      files: uploadedFiles,
      chatbotId,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      error: 'Failed to upload files',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Trigger chatbot build endpoint
app.post('/api/chatbots/:chatbotId/build', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { username, origin, indexName, language, files } = req.body;

    if (!username || !origin || !indexName) {
      return res.status(400).json({
        error: 'Missing required fields: username, origin, indexName'
      });
    }

    // Send build message to SQS
    const result = await sendBuildMessage({
      chatbotId,
      username,
      origin,
      indexName,
      language: language || 'en',
      files: files || [],
    });

    res.json({
      success: true,
      chatbotId,
      messageId: result.messageId,
      message: 'Build job queued successfully',
    });
  } catch (error) {
    console.error('Error triggering build:', error);
    res.status(500).json({
      error: 'Failed to trigger build',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

function startServer() {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
    console.log(`DynamoDB configured: ${process.env.DYNAMODB_ENDPOINT || 'AWS'}`);
    console.log(`[config] DASHBOARD_URL: ${process.env.DASHBOARD_URL || '(default localhost)'}`);
    console.log(`[config] WEBSITE_URL: ${process.env.WEBSITE_URL || '(default localhost)'}`);
    console.log(`[config] GOOGLE_SSO_CALLBACK_URL: ${process.env.GOOGLE_SSO_CALLBACK_URL || '(default localhost)'}`);
    console.log(`[config] COGNITO_DOMAIN: ${process.env.AWS_COGNITO_DOMAIN || '(not set)'}`);
    console.log(`[config] COGNITO_CLIENT_ID prefix: ${(process.env.AWS_COGNITO_CLIENT_ID || 'NOT_SET').substring(0, 8)}...`);
    console.log(`[config] ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS || '(default localhost)'}`);
  });
}

// Local DynamoDB (Docker) needs its tables auto-created on first run.
// In staging/prod, tables are managed by Terraform — skip the helper entirely
// so the production code path is obvious and never touches a real AWS account.
if (process.env.DYNAMODB_ENDPOINT) {
  ensureLocalTables()
    .then(startServer)
    .catch((err) => {
      console.error('Failed to ensure local tables:', err);
      startServer();
    });
} else {
  startServer();
}