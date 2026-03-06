import crypto from 'crypto';
import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item.js';

const TABLE_NAME = process.env.AWS_DYNAMO_RESPONSE_CACHE_TABLE || 'corpus-response-cache';
const DEFAULT_TTL_SECONDS = 60 * 60; // 1 hour

// ============================================================
// DynamoDB Model
// ============================================================

class ResponseCacheRecord extends Item {
  cacheKey!: string;
  chatbotId!: string;
  query!: string;
  answer!: string;
  citations!: string; // JSON-serialized
  model!: string;
  createdAt!: number;
  ttl!: number;
}

const ResponseCacheSchema = new dynamoose.Schema({
  cacheKey: {
    type: String,
    hashKey: true,
  },
  chatbotId: {
    type: String,
    index: {
      name: 'chatbotId-index',
    },
  },
  query: String,
  answer: String,
  citations: String,
  model: String,
  createdAt: Number,
  ttl: Number,
});

const ResponseCacheModel = dynamoose.model<ResponseCacheRecord>(
  TABLE_NAME,
  ResponseCacheSchema,
);

// ============================================================
// Cache key generation
// ============================================================

function buildCacheKey(chatbotId: string, query: string): string {
  const normalized = `${chatbotId}:${query.toLowerCase().trim()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// ============================================================
// Public API
// ============================================================

export interface CachedResponse {
  answer: string;
  citations: Array<{
    source: string;
    text: string;
    score: number;
    url?: string;
    pageNumber?: number;
  }>;
  model: string;
}

/**
 * Look up a cached response for the given chatbot + query.
 * Returns null on miss or any error (cache is best-effort).
 */
export async function getCachedResponse(
  chatbotId: string,
  query: string,
): Promise<CachedResponse | null> {
  try {
    const cacheKey = buildCacheKey(chatbotId, query);
    const record = await ResponseCacheModel.get(cacheKey);
    if (!record) return null;

    // DynamoDB TTL is eventually consistent; double-check expiry
    if (record.ttl && record.ttl < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      answer: record.answer,
      citations: JSON.parse(record.citations || '[]'),
      model: record.model,
    };
  } catch (err) {
    console.warn('Response cache lookup failed:', err);
    return null;
  }
}

/**
 * Write a response to the cache. Fire-and-forget safe.
 */
export async function setCachedResponse(
  chatbotId: string,
  query: string,
  result: CachedResponse,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const cacheKey = buildCacheKey(chatbotId, query);

    const record = new ResponseCacheModel({
      cacheKey,
      chatbotId,
      query: query.toLowerCase().trim(),
      answer: result.answer,
      citations: JSON.stringify(result.citations),
      model: result.model,
      createdAt: now,
      ttl: now + ttlSeconds,
    });

    await record.save();
  } catch (err) {
    console.warn('Response cache write failed:', err);
  }
}

/**
 * Delete all cached responses for a chatbot (e.g. on rebuild).
 */
export async function clearChatbotCache(chatbotId: string): Promise<void> {
  try {
    const records = await ResponseCacheModel.query('chatbotId')
      .eq(chatbotId)
      .using('chatbotId-index')
      .exec();

    if (records.length === 0) return;

    // Delete in batches
    for (const record of records) {
      await ResponseCacheModel.delete(record.cacheKey);
    }

    console.log(`Cleared ${records.length} cached responses for chatbot ${chatbotId}`);
  } catch (err) {
    console.warn(`Failed to clear cache for chatbot ${chatbotId}:`, err);
  }
}
