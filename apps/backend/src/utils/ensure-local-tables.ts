/**
 * Auto-creates DynamoDB tables when running locally (DynamoDB Local).
 * Only runs when DYNAMODB_ENDPOINT is set (local dev mode).
 * This ensures ElectroDB tables (which don't auto-create like Dynamoose) exist on startup.
 */
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  type CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb';

const TABLE_DEFINITIONS: CreateTableCommandInput[] = [
  {
    TableName: process.env.AWS_DYNAMO_CUSTOMIZATION_TABLE || 'corpus-customization-dev',
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
    TableName: process.env.AWS_DYNAMO_MAIN_TABLE || 'corpus-main-dev',
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
    GlobalSecondaryIndexes: [
      {
        IndexName: 'gsi1pk-gsi1sk-index',
        KeySchema: [
          { AttributeName: 'gsi1pk', KeyType: 'HASH' },
          { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.AWS_DYNAMO_ACCESS_CONTROL_TABLE || 'corpus-access-control-dev',
    KeySchema: [
      { AttributeName: 'chatbotId', KeyType: 'HASH' },
      { AttributeName: 'email', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'chatbotId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.AWS_DYNAMO_QUERY_LOG_TABLE || 'corpus-query-log-dev',
    KeySchema: [
      { AttributeName: 'passageIndex', KeyType: 'HASH' },
      { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'passageIndex', AttributeType: 'S' },
      { AttributeName: 'uniqueTimestamp', AttributeType: 'S' },
      { AttributeName: 'sessionId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'sessionId-uniqueTimestamp-index',
        KeySchema: [
          { AttributeName: 'sessionId', KeyType: 'HASH' },
          { AttributeName: 'uniqueTimestamp', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.AWS_DYNAMO_LEAD_GENERATION_TABLE || 'corpus-lead-generation-dev',
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
    TableName: process.env.AWS_DYNAMO_INTEGRATIONS_TABLE || 'corpus-integrations-dev',
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
    TableName: process.env.AWS_DYNAMO_AI_ACTIONS_TABLE || 'corpus-ai-actions-dev',
    KeySchema: [{ AttributeName: 'chatbotId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'chatbotId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.AWS_DYNAMO_API_KEYS_TABLE || 'corpus-api-keys-dev',
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
    TableName: process.env.AWS_DYNAMO_DATABASE_CONNECTIONS_TABLE || 'corpus-database-connections-dev',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'chatbotId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'chatbotId-index',
        KeySchema: [{ AttributeName: 'chatbotId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.AWS_DYNAMO_BUILTIN_INTEGRATIONS_TABLE || 'corpus-builtin-integrations-dev',
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
];

async function tableExists(client: DynamoDBClient, tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') return false;
    throw error;
  }
}

export async function ensureLocalTables(): Promise<void> {
  const endpoint = process.env.DYNAMODB_ENDPOINT;
  if (!endpoint) return; // Only run for local DynamoDB

  console.log('[DynamoDB Local] Checking tables...');

  const client = new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
  });

  let created = 0;

  for (const tableDef of TABLE_DEFINITIONS) {
    const name = tableDef.TableName!;
    try {
      const exists = await tableExists(client, name);
      if (!exists) {
        await client.send(new CreateTableCommand(tableDef));
        console.log(`[DynamoDB Local] Created table: ${name}`);
        created++;
      }
    } catch (error: any) {
      console.error(`[DynamoDB Local] Failed to create ${name}:`, error.message);
    }
  }

  if (created > 0) {
    console.log(`[DynamoDB Local] Auto-created ${created} missing table(s)`);
  } else {
    console.log('[DynamoDB Local] All tables exist');
  }
}
