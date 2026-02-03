const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
  },
});

async function createTable() {
  const params = {
    TableName: 'corpus-lead-generation-dev',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'gsi1pk', AttributeType: 'S' },
      { AttributeName: 'gsi1sk', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'gsi1pk-gsi1sk-index',
        KeySchema: [
          { AttributeName: 'gsi1pk', KeyType: 'HASH' },
          { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log('✅ Table corpus-lead-generation-dev created successfully!');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('✅ Table corpus-lead-generation-dev already exists');
    } else {
      console.error('❌ Error creating table:', error.message);
      throw error;
    }
  }
}

createTable();
