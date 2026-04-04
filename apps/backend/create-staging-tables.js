/**
 * One-time script: create all DynamoDB staging tables in real AWS.
 * Run: node create-staging-tables.js
 */
require('dotenv').config({ path: '.env.development' });

const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S = 'staging';

const TABLES = [
  {
    TableName: `corpus-users-${S}`,
    KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'username', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-chatbots-${S}`,
    KeySchema: [{ AttributeName: 'chatbotId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'username-index',
      KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-customization-${S}`,
    KeySchema: [
      { AttributeName: 'chatbotId', KeyType: 'HASH' },
      { AttributeName: 'id', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-main-${S}`,
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'gsi1pk', AttributeType: 'S' },
      { AttributeName: 'gsi1sk', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'gsi1pk-gsi1sk-index',
      KeySchema: [
        { AttributeName: 'gsi1pk', KeyType: 'HASH' },
        { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-access-control-${S}`,
    KeySchema: [
      { AttributeName: 'chatbotId', KeyType: 'HASH' },
      { AttributeName: 'email', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-query-log-${S}`,
    KeySchema: [
      { AttributeName: 'passageIndex', KeyType: 'HASH' },
      { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'passageIndex', AttributeType: 'S' },
      { AttributeName: 'uniqueTimestamp', AttributeType: 'S' },
      { AttributeName: 'sessionId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'sessionId-uniqueTimestamp-index',
      KeySchema: [
        { AttributeName: 'sessionId', KeyType: 'HASH' },
        { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-lead-generation-${S}`,
    KeySchema: [
      { AttributeName: 'chatbotId', KeyType: 'HASH' },
      { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'uniqueTimestamp', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-integrations-${S}`,
    KeySchema: [
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'sk', AttributeType: 'S' },
      { AttributeName: 'gsi1pk', AttributeType: 'S' },
      { AttributeName: 'gsi1sk', AttributeType: 'S' },
      { AttributeName: 'gsi2pk', AttributeType: 'S' },
      { AttributeName: 'gsi2sk', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'gsi1pk-gsi1sk-index',
        KeySchema: [
          { AttributeName: 'gsi1pk', KeyType: 'HASH' },
          { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'gsi2pk-gsi2sk-index',
        KeySchema: [
          { AttributeName: 'gsi2pk', KeyType: 'HASH' },
          { AttributeName: 'gsi2sk', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-api-keys-${S}`,
    KeySchema: [
      { AttributeName: 'chatbotId', KeyType: 'HASH' },
      { AttributeName: 'keyId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'keyId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-database-connections-${S}`,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'chatbotId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'chatbotId-index',
      KeySchema: [{ AttributeName: 'chatbotId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-chat-history-${S}`,
    KeySchema: [
      { AttributeName: 'chatbotId', KeyType: 'HASH' },
      { AttributeName: 'messageId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'messageId', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'username-chatbotId-index',
      KeySchema: [
        { AttributeName: 'username', KeyType: 'HASH' },
        { AttributeName: 'chatbotId', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-ai-actions-${S}`,
    KeySchema: [{ AttributeName: 'chatbotId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'chatbotId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-builtin-integrations-${S}`,
    KeySchema: [
      { AttributeName: 'chatbotId', KeyType: 'HASH' },
      { AttributeName: 'integrationKey', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'integrationKey', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: `corpus-response-cache-${S}`,
    KeySchema: [{ AttributeName: 'cacheKey', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'cacheKey', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (e) {
    // AWS SDK v3 surfaces this as e.message rather than e.name in some versions
    if (e.name === 'ResourceNotFoundException' || e.message === 'ResourceNotFoundException') return false;
    throw e;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\nCreating staging DynamoDB tables in', process.env.AWS_REGION || 'eu-north-1', '\n');
  let created = 0, exists = 0, failed = 0;

  for (const schema of TABLES) {
    try {
      if (await tableExists(schema.TableName)) {
        console.log('EXISTS  :', schema.TableName);
        exists++;
      } else {
        await client.send(new CreateTableCommand(schema));
        console.log('CREATED :', schema.TableName);
        created++;
        // Small delay between creates to avoid throttling
        await sleep(300);
      }
    } catch (e) {
      console.error('FAILED  :', schema.TableName, '-', e.name, e.message);
      failed++;
    }
  }

  console.log('\n  created=' + created + '  exists=' + exists + '  failed=' + failed + '\n');
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
