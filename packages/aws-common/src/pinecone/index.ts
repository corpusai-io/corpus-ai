import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '../utils/env';

/**
 * Pinecone Vector Database Integration
 * Manages vector storage and retrieval for RAG system
 */

let pineconeClient: Pinecone | null = null;

/**
 * Initialize Pinecone client
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = env('PINECONE_API_KEY');
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    pineconeClient = new Pinecone({
      apiKey,
    });
  }
  return pineconeClient;
}

/**
 * Get or create Pinecone index
 */
export async function getOrCreateIndex(indexName: string, dimension: number = 1536) {
  const client = getPineconeClient();

  try {
    // Try to describe the index
    const indexDescription = await client.describeIndex(indexName);
    console.log(`Index ${indexName} already exists`, indexDescription);
    return client.index(indexName);
  } catch (error: any) {
    if (error.status === 404) {
      // Index doesn't exist, create it
      console.log(`Creating index ${indexName}...`);
      await client.createIndex({
        name: indexName,
        dimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: env('PINECONE_REGION') || 'us-east-1',
          },
        },
      });

      // Wait for index to be ready
      console.log('Waiting for index to be ready...');
      await waitForIndexReady(indexName);

      return client.index(indexName);
    }
    throw error;
  }
}

/**
 * Wait for index to be ready
 */
async function waitForIndexReady(indexName: string, maxAttempts: number = 30) {
  const client = getPineconeClient();

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const description = await client.describeIndex(indexName);
      if (description.status?.ready) {
        console.log(`Index ${indexName} is ready!`);
        return;
      }
    } catch (error) {
      // Index might not be accessible yet
    }

    console.log(`Waiting for index... (attempt ${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error(`Index ${indexName} did not become ready in time`);
}

/**
 * Upsert vectors to Pinecone
 */
export async function upsertVectors(
  indexName: string,
  vectors: Array<{
    id: string;
    values: number[];
    metadata?: Record<string, any>;
  }>
) {
  const index = await getOrCreateIndex(indexName);

  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < vectors.length; i += batchSize) {
    batches.push(vectors.slice(i, i + batchSize));
  }

  console.log(`Upserting ${vectors.length} vectors in ${batches.length} batches...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    await index.upsert(batch);
    console.log(`Upserted batch ${i + 1}/${batches.length}`);
  }

  console.log('All vectors upserted successfully!');
}

/**
 * Query vectors from Pinecone
 */
export async function queryVectors(
  indexName: string,
  queryVector: number[],
  topK: number = 10,
  filter?: Record<string, any>
) {
  const index = await getOrCreateIndex(indexName);

  const queryRequest: any = {
    vector: queryVector,
    topK,
    includeMetadata: true,
    includeValues: false,
  };

  if (filter) {
    queryRequest.filter = filter;
  }

  const results = await index.query(queryRequest);
  return results.matches || [];
}

/**
 * Delete vectors from Pinecone
 */
export async function deleteVectors(indexName: string, ids: string[]) {
  const index = await getOrCreateIndex(indexName);
  await index.deleteMany(ids);
  console.log(`Deleted ${ids.length} vectors from ${indexName}`);
}

/**
 * Delete all vectors for a chatbot
 */
export async function deleteChatbotVectors(indexName: string, chatbotId: string) {
  const index = await getOrCreateIndex(indexName);
  await index.deleteMany({ chatbotId });
  console.log(`Deleted all vectors for chatbot ${chatbotId} from ${indexName}`);
}

/**
 * Get index stats
 */
export async function getIndexStats(indexName: string) {
  const index = await getOrCreateIndex(indexName);
  const stats = await index.describeIndexStats();
  return stats;
}

/**
 * Delete index
 */
export async function deleteIndex(indexName: string) {
  const client = getPineconeClient();
  await client.deleteIndex(indexName);
  console.log(`Deleted index ${indexName}`);
}
