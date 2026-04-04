import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '../utils/env';

/**
 * Pinecone Vector Database Integration
 * Manages vector storage and retrieval for RAG system
 */

let pineconeClient: Pinecone | null = null;
const indexCache = new Map<string, any>();

// ─── Retry Helper ────────────────────────────────────────────────────

function isTransientError(error: any): boolean {
  const status = error?.status ?? error?.statusCode ?? error?.response?.status;
  if (status === 429 || (status >= 500 && status < 600)) return true;
  const msg = (error?.message || '').toLowerCase();
  if (
    msg.includes('econnreset') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('socket hang up') ||
    msg.includes('network') ||
    msg.includes('fetch failed')
  ) {
    return true;
  }
  return false;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (attempt === maxRetries || !isTransientError(error)) {
        throw error;
      }
      const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      const jitter = Math.random() * baseDelay * 0.5;
      const delay = baseDelay + jitter;
      console.warn(
        `[Pinecone] ${label} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(delay)}ms: ${error.message}`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// ─── Index connection validation ─────────────────────────────────────

async function getValidatedIndex(indexName: string): Promise<any> {
  const cached = indexCache.get(indexName);
  if (cached) {
    try {
      // Light validation: describeIndexStats is cheap and confirms connectivity
      await cached.describeIndexStats();
      return cached;
    } catch (error: any) {
      console.warn(`[Pinecone] Cached index ${indexName} failed validation, refreshing: ${error.message}`);
      indexCache.delete(indexName);
    }
  }
  return getOrCreateIndex(indexName);
}

/**
 * Pre-warm a Pinecone index connection so the first real query is fast.
 */
export async function warmPineconeConnection(indexName: string): Promise<void> {
  try {
    await getValidatedIndex(indexName);
    console.log(`[Pinecone] Warmed connection to index ${indexName}`);
  } catch (error: any) {
    console.warn(`[Pinecone] Failed to warm connection to ${indexName}: ${error.message}`);
  }
}

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
export async function getOrCreateIndex(indexName: string, dimension: number = 3072) {
  // Return cached index object if available
  if (indexCache.has(indexName)) {
    return indexCache.get(indexName);
  }

  const client = getPineconeClient();

  try {
    // Try to describe the index
    const indexDescription = await client.describeIndex(indexName);
    console.log(`Index ${indexName} ready (${indexDescription.status?.state})`);
    const index = client.index(indexName);
    indexCache.set(indexName, index);
    return index;
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
 * Truncate vector metadata to stay under Pinecone's 40KB limit.
 * Shrinks the longest string field(s) until total size is within budget.
 */
function truncateMetadata(metadata: Record<string, any>, maxBytes: number = 39000): Record<string, any> {
  let serialized = JSON.stringify(metadata);
  if (Buffer.byteLength(serialized, 'utf-8') <= maxBytes) {
    return metadata;
  }

  const truncated = { ...metadata };
  // Find the largest string field and truncate it
  const stringFields = Object.entries(truncated)
    .filter(([, v]) => typeof v === 'string')
    .sort((a, b) => (b[1] as string).length - (a[1] as string).length);

  for (const [key] of stringFields) {
    while (Buffer.byteLength(JSON.stringify(truncated), 'utf-8') > maxBytes && (truncated[key] as string).length > 100) {
      truncated[key] = (truncated[key] as string).slice(0, Math.floor((truncated[key] as string).length * 0.8));
    }
    if (Buffer.byteLength(JSON.stringify(truncated), 'utf-8') <= maxBytes) break;
  }

  return truncated;
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
  }>,
  namespace?: string
) {
  const index = await getValidatedIndex(indexName);
  const target = namespace ? index.namespace(namespace) : index;

  // Truncate metadata to stay under Pinecone's 40KB limit
  const safeVectors = vectors.map(v => ({
    ...v,
    metadata: v.metadata ? truncateMetadata(v.metadata) : v.metadata,
  }));

  const batchSize = 100;
  const batches: (typeof safeVectors)[] = [];

  for (let i = 0; i < safeVectors.length; i += batchSize) {
    batches.push(safeVectors.slice(i, i + batchSize));
  }

  console.log(`Upserting ${vectors.length} vectors in ${batches.length} batches to ${namespace || 'default'} namespace...`);

  for (let i = 0; i < batches.length; i++) {
    await withRetry(
      () => target.upsert(batches[i]),
      `upsert batch ${i + 1}/${batches.length}`
    );
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
  filter?: Record<string, any>,
  namespace?: string
) {
  const index = await getValidatedIndex(indexName);
  const target = namespace ? index.namespace(namespace) : index;

  const queryRequest: any = {
    vector: queryVector,
    topK,
    includeMetadata: true,
    includeValues: false,
  };

  if (filter) {
    queryRequest.filter = filter;
  }

  const results: any = await withRetry(
    () => target.query(queryRequest),
    `query ${indexName}/${namespace || 'default'}`
  );
  const matches = results.matches || [];
  if (matches.length > 0) {
    console.log(`[Pinecone] ${matches.length} matches found. Top scores: ${matches.slice(0, 3).map((m: any) => m.score?.toFixed(4)).join(', ')}`);
  } else {
    console.log(`[Pinecone] 0 matches in namespace=${namespace || 'default'}, index=${indexName}`);
  }
  return matches;
}

/**
 * Delete vectors from Pinecone
 */
export async function deleteVectors(indexName: string, ids: string[], namespace?: string) {
  const index = await getValidatedIndex(indexName);
  const target = namespace ? index.namespace(namespace) : index;
  await withRetry(
    () => target.deleteMany(ids),
    `deleteVectors ${indexName}/${namespace || 'default'}`
  );
  console.log(`Deleted ${ids.length} vectors from ${indexName}/${namespace || 'default'}`);
}

/**
 * Delete all vectors for a chatbot
 */
export async function deleteChatbotVectors(indexName: string, chatbotId: string) {
  const index = await getValidatedIndex(indexName);
  const ns = index.namespace(chatbotId);
  await withRetry(
    () => ns.deleteAll(),
    `deleteChatbotVectors ${chatbotId}`
  );
  console.log(`Deleted all vectors for chatbot ${chatbotId} from namespace`);
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

// ─── Hybrid Search & Reciprocal Rank Fusion ─────────────────────────

export interface ScoredMatch {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

/**
 * Reciprocal Rank Fusion - merges multiple ranked lists into one.
 * Documents appearing in multiple lists get boosted.
 * @param k - smoothing constant (default 60, standard in literature)
 */
export function reciprocalRankFusion(
  ...rankedLists: ScoredMatch[][]
): ScoredMatch[] {
  const k = 60;
  const scoreMap = new Map<string, { score: number; metadata?: Record<string, any> }>();

  for (const list of rankedLists) {
    for (let rank = 0; rank < list.length; rank++) {
      const item = list[rank];
      const rrfScore = 1 / (k + rank + 1);
      const existing = scoreMap.get(item.id);

      if (existing) {
        existing.score += rrfScore;
        // Merge metadata (prefer first occurrence)
        if (!existing.metadata && item.metadata) {
          existing.metadata = item.metadata;
        }
      } else {
        scoreMap.set(item.id, {
          score: rrfScore,
          metadata: item.metadata,
        });
      }
    }
  }

  // Sort by fused score descending
  return Array.from(scoreMap.entries())
    .map(([id, data]) => ({ id, score: data.score, metadata: data.metadata }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Query sparse vectors from a sparse Pinecone index.
 */
export async function querySparseVectors(
  indexName: string,
  sparseVector: { indices: number[]; values: number[] },
  topK: number = 10,
  namespace?: string
) {
  try {
    const index = await getOrCreateIndex(indexName);
    const target = namespace ? index.namespace(namespace) : index;

    const results = await target.query({
      sparseVector,
      topK,
      includeMetadata: true,
    } as any);

    return results.matches || [];
  } catch (error: any) {
    console.warn(`Sparse query failed for ${indexName}:`, error.message);
    return []; // Graceful fallback
  }
}

/**
 * Hybrid search: parallel dense + sparse queries, merged with RRF.
 * Requires two Pinecone indexes: one dense, one sparse.
 * Falls back to dense-only if sparse index is not configured.
 */
export async function hybridQuery(
  denseIndexName: string,
  queryVector: number[],
  topK: number = 10,
  namespace?: string,
  options?: {
    sparseIndexName?: string;
    sparseVector?: { indices: number[]; values: number[] };
    filter?: Record<string, any>;
  }
): Promise<ScoredMatch[]> {
  const { sparseIndexName, sparseVector, filter } = options || {};

  // Always do dense search
  const densePromise = queryVectors(denseIndexName, queryVector, topK * 2, filter, namespace);

  // Optionally do sparse search in parallel
  let sparsePromise: Promise<any[]> | undefined;
  if (sparseIndexName && sparseVector) {
    sparsePromise = querySparseVectors(sparseIndexName, sparseVector, topK * 2, namespace);
  }

  // Wait for both
  const [denseResults, sparseResults] = await Promise.all([
    densePromise,
    sparsePromise || Promise.resolve([]),
  ]);

  // Convert to ScoredMatch format
  const denseMatches: ScoredMatch[] = denseResults.map((m: any) => ({
    id: m.id,
    score: m.score || 0,
    metadata: m.metadata,
  }));

  const sparseMatches: ScoredMatch[] = sparseResults.map((m: any) => ({
    id: m.id,
    score: m.score || 0,
    metadata: m.metadata,
  }));

  // If no sparse results, just return dense
  if (sparseMatches.length === 0) {
    return denseMatches.slice(0, topK);
  }

  // Fuse with RRF
  const fused = reciprocalRankFusion(denseMatches, sparseMatches);
  return fused.slice(0, topK);
}
