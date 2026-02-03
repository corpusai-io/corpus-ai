import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dynamoose from 'dynamoose';
import path from 'path';
import multer from 'multer';

// Load environment-specific .env file FIRST
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

// NOW import modules that need environment variables
import { uploadFileToS3, getRawFilePath, sendBuildMessage, getQueueStats } from '@corpusai/aws-common';

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

// Import middleware
import { errorHandler } from './middleware/validation.middleware';

// Configure DynamoDB connection
if (process.env.DYNAMODB_ENDPOINT) {
  console.log(`Connecting to DynamoDB Local at ${process.env.DYNAMODB_ENDPOINT}`);
  dynamoose.aws.ddb.local(process.env.DYNAMODB_ENDPOINT);
} else {
  console.log(`Connecting to AWS DynamoDB in region ${process.env.AWS_REGION || 'us-west-2'}`);
}

const app = express();
const port = process.env.PORT || 8001;

// CORS configuration for credentials
app.use(cors({
  origin: 'http://localhost:8080', // Allow dashboard origin
  credentials: true, // Allow credentials (cookies, authorization headers)
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

// Health check routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    dynamodb: process.env.DYNAMODB_ENDPOINT ? 'local' : 'aws',
    region: process.env.AWS_REGION || 'us-west-2'
  });
});

// Test endpoint to verify DynamoDB connection
app.get('/health/db', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      message: 'DynamoDB connection configured',
      endpoint: process.env.DYNAMODB_ENDPOINT || 'AWS',
      tables: {
        chatbot: process.env.AWS_DYNAMO_CHATBOT_TABLE,
        user: process.env.AWS_DYNAMO_USER_TABLE,
        customization: process.env.AWS_DYNAMO_CUSTOMIZATION_TABLE,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint for S3 connection
app.get('/health/s3', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      message: 'S3 connection configured',
      bucket: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
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
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!chatbotId || !username) {
      return res.status(400).json({ error: 'Missing chatbotId or username' });
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

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`DynamoDB configured: ${process.env.DYNAMODB_ENDPOINT || 'AWS'}`);
  console.log('\n=== API Routes ===\n');
  console.log('  AUTH:');
  console.log('    POST   /api/auth/register    - Register new user');
  console.log('    POST   /api/auth/login       - Login user');
  console.log('    POST   /api/auth/logout      - Logout user');
  console.log('    POST   /api/auth/confirm     - Confirm user email (dev only)');
  console.log('    GET    /api/auth/me          - Get current user (protected)');
  console.log('    GET    /api/auth/verify      - Verify JWT token');
  console.log('\n  CHATBOTS:');
  console.log('    POST   /api/chatbots         - Create chatbot (protected)');
  console.log('    GET    /api/chatbots         - List chatbots (protected)');
  console.log('    GET    /api/chatbots/:id     - Get chatbot (protected)');
  console.log('    PUT    /api/chatbots/:id     - Update chatbot (protected)');
  console.log('    DELETE /api/chatbots/:id     - Delete chatbot (protected)');
  console.log('    POST   /api/chatbots/:id/rebuild - Rebuild chatbot (protected)');
  console.log('    GET    /api/chatbots/:id/status  - Get build status (protected)');
  console.log('\n  CUSTOMIZE:');
  console.log('    GET    /api/customize/:chatbotId              - Get customization (protected)');
  console.log('    PUT    /api/customize/:chatbotId              - Update customization (protected)');
  console.log('    POST   /api/customize/:chatbotId/theme        - Update theme colors (protected)');
  console.log('    POST   /api/customize/:chatbotId/prompt       - Update system prompt (protected)');
  console.log('\n  DATA STORE:');
  console.log('    GET    /api/data-store/:chatbotId             - List data records (protected)');
  console.log('    POST   /api/data-store/:chatbotId             - Add data record (protected)');
  console.log('    PUT    /api/data-store/:chatbotId/:dataId     - Update data record (protected)');
  console.log('    DELETE /api/data-store/:chatbotId/:dataId     - Delete data record (protected)');
  console.log('    POST   /api/data-store/:chatbotId/batch       - Batch add records (protected)');
  console.log('    DELETE /api/data-store/:chatbotId/batch       - Batch delete records (protected)');
  console.log('\n  LEADS:');
  console.log('    GET    /api/leads/:chatbotId                  - List leads (protected)');
  console.log('    POST   /api/leads/:chatbotId                  - Add lead (PUBLIC)');
  console.log('    GET    /api/leads/:chatbotId/export           - Export leads CSV (protected)');
  console.log('    PUT    /api/leads/:chatbotId/fields           - Update form fields (protected)');
  console.log('    GET    /api/leads/:chatbotId/fields           - Get form fields (protected)');
  console.log('\n  QUERY LOG:');
  console.log('    GET    /api/query-log/:chatbotId              - Get query logs (protected)');
  console.log('    POST   /api/query-log/:chatbotId/search       - Search logs (protected)');
  console.log('    POST   /api/query-log/:chatbotId/feedback     - Record feedback (protected)');
  console.log('    GET    /api/query-log/:chatbotId/export       - Export logs CSV (protected)');
  console.log('    GET    /api/query-log/:chatbotId/analytics    - Get analytics (protected)');
  console.log('\n  ACCESS CONTROL:');
  console.log('    GET    /api/access-control/:chatbotId         - List access (protected)');
  console.log('    POST   /api/access-control/:chatbotId         - Grant access (protected)');
  console.log('    DELETE /api/access-control/:chatbotId/:email  - Revoke access (protected)');
  console.log('    PUT    /api/access-control/:chatbotId/mode    - Set access mode (protected)');
  console.log('    POST   /api/access-control/:chatbotId/apikey  - Generate API key (protected)');
  console.log('    POST   /api/access-control/validate           - Validate API key (PUBLIC)');
  console.log('\n  INTEGRATIONS:');
  console.log('    GET    /api/integrations/:chatbotId           - List integrations (protected)');
  console.log('    GET    /api/integrations/slack/oauth          - Slack OAuth (PUBLIC)');
  console.log('    POST   /api/integrations/slack/:chatbotId     - Connect Slack (protected)');
  console.log('    DELETE /api/integrations/slack/:chatbotId     - Disconnect Slack (protected)');
  console.log('    POST   /api/integrations/zapier/subscribe     - Zapier subscribe (protected)');
  console.log('    DELETE /api/integrations/zapier/unsubscribe   - Zapier unsubscribe (protected)');
  console.log('    GET    /api/integrations/zapier/samples       - Zapier samples (PUBLIC)');
  console.log('    GET    /api/integrations/google-drive/profiles - List Drive profiles (protected)');
  console.log('    POST   /api/integrations/google-drive/:chatbotId - Connect Drive (protected)');
  console.log('    DELETE /api/integrations/google-drive/:chatbotId - Disconnect Drive (protected)');
  console.log('    POST   /api/integrations/telegram/:chatbotId  - Connect Telegram (protected)');
  console.log('    DELETE /api/integrations/telegram/:chatbotId  - Disconnect Telegram (protected)');
  console.log('    POST   /api/integrations/whatsapp/:chatbotId  - Connect WhatsApp (protected)');
  console.log('    DELETE /api/integrations/whatsapp/:chatbotId  - Disconnect WhatsApp (protected)');
  console.log('\n  USER PROFILE:');
  console.log('    GET    /api/user/profile                      - Get profile (protected)');
  console.log('    PUT    /api/user/profile                      - Update profile (protected)');
  console.log('    PUT    /api/user/password                     - Change password (protected)');
  console.log('    DELETE /api/user/account                      - Delete account (protected)');
  console.log('    GET    /api/user/stats                        - Get user stats (protected)');
  console.log('\n  QUOTA MANAGEMENT:');
  console.log('    GET    /api/quota                             - Get quota (protected)');
  console.log('    GET    /api/quota/:chatbotId                  - Check chatbot quota (protected)');
  console.log('    GET    /api/quota/usage                       - Get usage stats (protected)');
  console.log('    GET    /api/quota/tiers                       - Get available tiers (protected)');
  console.log('\n  PAYMENT (STRIPE):');
  console.log('    POST   /api/payment/webhook                   - Stripe webhook (PUBLIC)');
  console.log('    GET    /api/payment/plans                     - Get pricing plans (PUBLIC)');
  console.log('    POST   /api/payment/checkout                  - Create checkout session (protected)');
  console.log('    POST   /api/payment/portal                    - Customer portal (protected)');
  console.log('    GET    /api/payment/subscription              - Get subscription (protected)');
  console.log('    POST   /api/payment/cancel                    - Cancel subscription (protected)');
  console.log('\n==================\n');
});