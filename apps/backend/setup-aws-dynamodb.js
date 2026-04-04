/**
 * AWS DynamoDB Table Setup Script
 *
 * This script will:
 * 1. Check if tables exist in AWS DynamoDB
 * 2. Create any missing tables
 * 3. Report status of all tables
 *
 * Usage: node setup-aws-dynamodb.js
 */

// Support --stage flag: node setup-aws-dynamodb.js --stage staging
const stageArg = (() => {
  const i = process.argv.indexOf('--stage');
  return i !== -1 ? process.argv[i + 1] : null;
})();

// Load env file: prefer .env.<stage>, fall back to .env.development
const envFile = stageArg ? `.env.${stageArg}` : '.env.development';
require('dotenv').config({ path: envFile });

const {
  DynamoDBClient,
  ListTablesCommand,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists
} = require('@aws-sdk/client-dynamodb');

// Check for --local flag to target DynamoDB Local
const isLocal = process.argv.includes('--local');
const localEndpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';

// Derive table suffix from stage (staging → -staging, production → -prod, dev → -dev)
const stageSuffix = stageArg === 'staging' ? 'staging'
  : stageArg === 'production' ? 'prod'
  : 'dev';

if (!isLocal) {
  // Validate credentials for AWS
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ ERROR: AWS credentials not found in .env.development');
    console.error('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    console.error('   Or use --local flag to target DynamoDB Local');
    process.exit(1);
  }
}

// Initialize DynamoDB client
const clientConfig = isLocal
  ? {
      endpoint: localEndpoint,
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: { accessKeyId: 'local', secretAccessKey: 'local' }
    }
  : {
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    };

const client = new DynamoDBClient(clientConfig);

// Helper: resolve table name — env var takes priority, then auto-derive from suffix
function tbl(envVar, baseName) {
  return process.env[envVar] || `${baseName}-${stageSuffix}`;
}

console.log('\n🚀 Starting DynamoDB Setup...\n');
if (isLocal) {
  console.log('📍 Target: DynamoDB Local at', localEndpoint);
} else {
  console.log('📍 Target: AWS DynamoDB');
  console.log('📍 Region:', process.env.AWS_REGION || 'eu-north-1');
  console.log('📍 Stage:', stageSuffix);
  console.log('🔑 Access Key:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
}
console.log('\n' + '='.repeat(60) + '\n');

// Define all tables with their schemas
const tables = [
  {
    name: tbl('AWS_DYNAMO_USER_TABLE', 'corpus-users'),
    schema: {
      TableName: tbl('AWS_DYNAMO_USER_TABLE', 'corpus-users'),
      KeySchema: [
        { AttributeName: 'username', KeyType: 'HASH' } // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'username', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand (no provisioned capacity needed)
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_CHATBOT_TABLE', 'corpus-chatbots'),
    schema: {
      TableName: tbl('AWS_DYNAMO_CHATBOT_TABLE', 'corpus-chatbots'),
      KeySchema: [
        { AttributeName: 'chatbotId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'chatbotId', AttributeType: 'S' },
        { AttributeName: 'username', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'username-index',
          KeySchema: [
            { AttributeName: 'username', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_CUSTOMIZATION_TABLE', 'corpus-customization'),
    schema: {
      TableName: tbl('AWS_DYNAMO_CUSTOMIZATION_TABLE', 'corpus-customization'),
      KeySchema: [
        { AttributeName: 'chatbotId', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'chatbotId', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_MAIN_TABLE', 'corpus-main'),
    schema: {
      TableName: tbl('AWS_DYNAMO_MAIN_TABLE', 'corpus-main'),
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },  // ElectroDB composite partition key (uppercase)
        { AttributeName: 'SK', KeyType: 'RANGE' }  // ElectroDB composite sort key (uppercase)
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'gsi1pk', AttributeType: 'S' },
        { AttributeName: 'gsi1sk', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'gsi1pk-gsi1sk-index',
          KeySchema: [
            { AttributeName: 'gsi1pk', KeyType: 'HASH' },
            { AttributeName: 'gsi1sk', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_ACCESS_CONTROL_TABLE', 'corpus-access-control'),
    schema: {
      TableName: tbl('AWS_DYNAMO_ACCESS_CONTROL_TABLE', 'corpus-access-control'),
      KeySchema: [
        { AttributeName: 'chatbotId', KeyType: 'HASH' },
        { AttributeName: 'email', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'chatbotId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'email-index',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_QUERY_LOG_TABLE', 'corpus-query-log'),
    schema: {
      TableName: tbl('AWS_DYNAMO_QUERY_LOG_TABLE', 'corpus-query-log'),
      KeySchema: [
        { AttributeName: 'passageIndex', KeyType: 'HASH' },
        { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'passageIndex', AttributeType: 'S' },
        { AttributeName: 'uniqueTimestamp', AttributeType: 'S' },
        { AttributeName: 'sessionId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'sessionId-uniqueTimestamp-index',
          KeySchema: [
            { AttributeName: 'sessionId', KeyType: 'HASH' },
            { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_LEAD_GENERATION_TABLE', 'corpus-lead-generation'),
    schema: {
      TableName: tbl('AWS_DYNAMO_LEAD_GENERATION_TABLE', 'corpus-lead-generation'),
      KeySchema: [
        { AttributeName: 'chatbotId', KeyType: 'HASH' },
        { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'chatbotId', AttributeType: 'S' },
        { AttributeName: 'uniqueTimestamp', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_INTEGRATIONS_TABLE', 'corpus-integrations'),
    schema: {
      TableName: tbl('AWS_DYNAMO_INTEGRATIONS_TABLE', 'corpus-integrations'),
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        { AttributeName: 'gsi1pk', AttributeType: 'S' },
        { AttributeName: 'gsi1sk', AttributeType: 'S' },
        { AttributeName: 'gsi2pk', AttributeType: 'S' },
        { AttributeName: 'gsi2sk', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'gsi1pk-gsi1sk-index',
          KeySchema: [
            { AttributeName: 'gsi1pk', KeyType: 'HASH' },
            { AttributeName: 'gsi1sk', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        },
        {
          IndexName: 'gsi2pk-gsi2sk-index',
          KeySchema: [
            { AttributeName: 'gsi2pk', KeyType: 'HASH' },
            { AttributeName: 'gsi2sk', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_CHAT_HISTORY_TABLE', 'corpus-chat-history'),
    schema: {
      TableName: tbl('AWS_DYNAMO_CHAT_HISTORY_TABLE', 'corpus-chat-history'),
      KeySchema: [
        { AttributeName: 'chatbotId', KeyType: 'HASH' },
        { AttributeName: 'messageId', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'chatbotId', AttributeType: 'S' },
        { AttributeName: 'messageId', AttributeType: 'S' },
        { AttributeName: 'username', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'username-chatbotId-index',
          KeySchema: [
            { AttributeName: 'username', KeyType: 'HASH' },
            { AttributeName: 'chatbotId', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_API_KEYS_TABLE', 'corpus-api-keys'),
    schema: {
      TableName: tbl('AWS_DYNAMO_API_KEYS_TABLE', 'corpus-api-keys'),
      KeySchema: [
        { AttributeName: 'chatbotId', KeyType: 'HASH' },
        { AttributeName: 'keyId', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'chatbotId', AttributeType: 'S' },
        { AttributeName: 'keyId', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  },
  {
    name: tbl('AWS_DYNAMO_DATABASE_CONNECTIONS_TABLE', 'corpus-database-connections'),
    schema: {
      TableName: tbl('AWS_DYNAMO_DATABASE_CONNECTIONS_TABLE', 'corpus-database-connections'),
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'chatbotId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'chatbotId-index',
          KeySchema: [
            { AttributeName: 'chatbotId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Environment', Value: 'development' },
        { Key: 'Project', Value: 'corpus-ai' }
      ]
    }
  }
];

/**
 * Check if a table exists
 */
async function tableExists(tableName) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    return response.Table.TableStatus;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException' || error.message === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

/**
 * Create a table
 */
async function createTable(tableConfig) {
  try {
    const schema = { ...tableConfig.schema };
    // DynamoDB Local doesn't support Tags
    if (isLocal) {
      delete schema.Tags;
    }
    const command = new CreateTableCommand(schema);
    await client.send(command);

    console.log(`⏳ Creating table: ${tableConfig.name}...`);

    // Wait for table to be active (skip for local — tables are instant)
    if (!isLocal) {
      await waitUntilTableExists(
        { client, maxWaitTime: 120 },
        { TableName: tableConfig.name }
      );
    }

    console.log(`✅ Table created: ${tableConfig.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create table ${tableConfig.name}:`, error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function setupTables() {
  let existingCount = 0;
  let createdCount = 0;
  let failedCount = 0;

  console.log('🔍 Checking existing tables...\n');

  for (const table of tables) {
    try {
      const status = await tableExists(table.name);

      if (status) {
        console.log(`✅ EXISTS: ${table.name} (Status: ${status})`);
        existingCount++;
      } else {
        console.log(`❌ NOT FOUND: ${table.name}`);
        console.log(`   Creating table...`);

        const created = await createTable(table);
        if (created) {
          createdCount++;
        } else {
          failedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ ERROR checking ${table.name}:`, error.message);
      failedCount++;
    }

    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 SUMMARY:\n');
  console.log(`   ✅ Already existing: ${existingCount}`);
  console.log(`   🆕 Newly created:    ${createdCount}`);
  console.log(`   ❌ Failed:           ${failedCount}`);
  console.log(`   📦 Total tables:     ${tables.length}`);
  console.log('\n' + '='.repeat(60) + '\n');

  if (failedCount > 0) {
    console.log('⚠️  Some tables failed to create. Please check AWS IAM permissions.');
    console.log('   Required permission: AmazonDynamoDBFullAccess\n');
    process.exit(1);
  }

  if (createdCount > 0) {
    console.log('🎉 Setup complete! All tables are ready.');
    console.log('   You can now start your backend with: pnpm dev\n');
  } else {
    console.log('✅ All tables already exist! You\'re ready to go.');
    console.log('   Start your backend with: pnpm dev\n');
  }
}

// Run the setup
setupTables()
  .catch(error => {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('\nPossible causes:');
    console.error('  1. Invalid AWS credentials');
    console.error('  2. Insufficient IAM permissions');
    console.error('  3. Network connectivity issues');
    console.error('  4. Incorrect AWS region\n');
    process.exit(1);
  });
