import OpenAI from 'openai';
import { getChatbotById } from '../dynamo-models/chatbot.model';
import { UserModel } from '../dynamo-models/user.model';
import { QueryLogModel } from '../dynamo-models/querylog.model';
import { CustomizationModel } from '../dynamo-models/customize.model';
import {
  retrievePassages,
  hybridRetrievePassages,
  multiQueryRetrieve,
  hydeRetrieve,
  buildRAGPrompt,
  extractCitations,
  getDiversePassages,
} from './retrieval';
import type { RetrievedPassage, RetrievalOptions } from './retrieval';
import { getCachedResponse, setCachedResponse } from './response-cache';
import { runTextToSQL } from '../text-to-sql';

/**
 * Unified RAG Query Processor
 *
 * Single source of truth for the chat query pipeline used by all channels:
 * REST, WebSocket, Telegram, WhatsApp, Slack, and the backend dev proxy.
 */

// ============================================================
// Fire-and-forget helpers
// ============================================================

/**
 * Tracks in-flight fire-and-forget writes so Lambda can await them
 * before the runtime freezes the process.
 */
const _pendingWrites: Promise<any>[] = [];

/**
 * Execute `fn` without blocking the caller. Errors are caught and logged
 * with the provided label but never bubble up.
 */
function fireAndForget(fn: () => Promise<void>, label: string): void {
  const p = fn().catch((err) => {
    console.error(`[fireAndForget] ${label}:`, err);
  });
  _pendingWrites.push(p);
  // Housekeep: remove settled promises so the array doesn't grow unboundedly
  p.finally(() => {
    const idx = _pendingWrites.indexOf(p);
    if (idx !== -1) _pendingWrites.splice(idx, 1);
  });
}

/**
 * Await every in-flight fire-and-forget write.
 *
 * **Lambda cold-stop consideration**: In AWS Lambda the runtime may freeze
 * the process immediately after the response is returned. Call this function
 * (e.g. in the Lambda handler, after sending the HTTP response) to ensure
 * DynamoDB writes are not silently dropped.  In a long-lived Express process
 * this is not strictly necessary but is harmless to call.
 */
export async function flushPendingWrites(): Promise<void> {
  await Promise.allSettled(_pendingWrites);
}

// ============================================================
// Interfaces
// ============================================================

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QueryOptions {
  chatbotId: string;
  query: string;

  /** Owner email — omit for anonymous / API-key callers */
  username?: string;

  /** Session identifier for logging */
  sessionId: string;

  /** Prior conversation turns (caller loads from its own store) */
  conversationHistory?: ConversationMessage[];

  // RAG tuning
  topK?: number;          // default 5
  minScore?: number;      // default 0.3
  maxTokens?: number;     // default 1000
  temperature?: number;   // default 0.7

  /** Appended to the system prompt (channel-specific formatting hints) */
  systemPromptSuffix?: string;

  /** Enable OpenAI streaming */
  stream?: boolean;

  /** Called for each streamed token. Only used when stream=true. */
  onChunk?: (chunk: string, chunkIndex: number) => Promise<void>;

  /** Skip user quota check (e.g. anonymous / integration callers) */
  skipQuotaCheck?: boolean;

  /** Skip response cache lookup */
  skipCache?: boolean;

  /** Channel name for logging ('rest', 'websocket', 'telegram', etc.) */
  channel?: string;

  /**
   * Allow BUILDING status (used by backend local dev proxy where
   * the build pipeline may not be running).
   */
  allowBuildingStatus?: boolean;
}

export interface QueryResult {
  answer: string;
  citations: Array<{
    source: string;
    text: string;
    score: number;
    url?: string;
    pageNumber?: number;
  }>;
  passages: RetrievedPassage[];
  duration: number;
  sessionId: string;
  chatbotId: string;
  model: string;
  usage?: OpenAI.CompletionUsage;
  cached: boolean;
  queryLogId?: string;
  queryType?: 'rag' | 'database';
  executedQuery?: string;
  connectionName?: string;
}

// ============================================================
// Internal helpers
// ============================================================

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw Object.assign(
        new Error('OPENAI_API_KEY is not configured'),
        { statusCode: 500, code: 'CONFIG_ERROR' },
      );
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

/** Load the per-chatbot LLM model from customization table */
async function getChatbotModel(chatbotId: string): Promise<string> {
  try {
    const records = await CustomizationModel.query('chatbotId').eq(chatbotId).exec();
    const llmRecord = records.find((r: any) => r.type === 'llm');
    if (llmRecord && llmRecord.value) return llmRecord.value;
  } catch (err) {
    console.warn('Could not fetch customization for model selection:', err);
  }
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

/** Load the per-chatbot system prompt from customization table */
async function getChatbotSystemPrompt(chatbotId: string, chatbotTitle: string): Promise<string> {
  try {
    const records = await CustomizationModel.query('chatbotId').eq(chatbotId).exec();
    const promptRecord = records.find((r: any) => r.type === 'systemPrompt');
    if (promptRecord && promptRecord.value) return promptRecord.value;
  } catch (err) {
    console.warn('Could not fetch customization for system prompt:', err);
  }
  return `You are a helpful AI assistant for ${chatbotTitle || 'this chatbot'}.

Answer the user's question using the context provided below. If the context doesn't contain relevant information to answer the question, say so clearly and provide the best answer you can based on your general knowledge.

When answering:
1. Prioritize information from the context
2. Cite sources using [1], [2], etc. corresponding to the context numbers
3. Be honest if you don't know something
4. Keep your response clear and concise`;
}

// ============================================================
// Query complexity classification
// ============================================================

type QueryComplexity = 'simple' | 'complex' | 'vague';

/**
 * Classify query complexity to choose the best retrieval strategy.
 * - 'vague': short or ambiguous queries → HyDE
 * - 'complex': multi-part or comparison questions → multi-query
 * - 'simple': straightforward factual queries → hybrid + rerank
 */
function classifyQueryComplexity(query: string): QueryComplexity {
  const words = query.trim().split(/\s+/);

  // Very short queries are usually vague
  if (words.length <= 3) return 'vague';

  const lowerQuery = query.toLowerCase();

  // Multi-part questions (conjunctions, comparisons, multiple question marks)
  const complexPatterns = [
    /\band\b.*\?/,       // "What is X and how does Y?"
    /\bcompare\b/,       // "Compare X with Y"
    /\bvs\.?\b/,         // "X vs Y"
    /\bdifference\b/,    // "What's the difference between"
    /\brelationship\b/,  // "What is the relationship"
    /\bbetween\b/,       // "between X and Y"
    /\bhow does .+ affect\b/, // "How does X affect Y?"
    /\bwhy .+ and\b/,    // "Why X and Y?"
  ];

  if (complexPatterns.some(p => p.test(lowerQuery))) return 'complex';

  // Ambiguous or open-ended queries
  const vaguePatterns = [
    /^(what|tell me|explain)\s+(about|is)\b/i,
    /^(help|info)\b/i,
    /^how\s*$/i,
  ];

  if (vaguePatterns.some(p => p.test(lowerQuery))) return 'vague';

  return 'simple';
}

// ============================================================
// processQuery — the unified pipeline
// ============================================================

export async function processQuery(options: QueryOptions): Promise<QueryResult> {
  const {
    chatbotId,
    query,
    username,
    sessionId,
    conversationHistory = [],
    topK = 5,
    minScore = 0.3,
    maxTokens = 1000,
    temperature = 0.7,
    systemPromptSuffix,
    stream = false,
    onChunk,
    skipQuotaCheck = false,
    skipCache: _skipCache = false,
    channel = 'unknown',
    allowBuildingStatus = false,
  } = options;

  const startTime = Date.now();

  // ----------------------------------------------------------
  // Step 1: Validate chatbot
  // ----------------------------------------------------------
  const chatbot = await getChatbotById(chatbotId);
  if (!chatbot) {
    throw Object.assign(new Error('Chatbot not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  const validStatuses = allowBuildingStatus
    ? ['ACTIVE', 'BUILDING']
    : ['ACTIVE'];

  if (!validStatuses.includes(chatbot.status)) {
    throw Object.assign(
      new Error(`Chatbot is not active. Status: ${chatbot.status}`),
      { statusCode: 400, code: 'CHATBOT_NOT_ACTIVE' },
    );
  }

  // ----------------------------------------------------------
  // Step 2: Check user quota
  // ----------------------------------------------------------
  if (username && !skipQuotaCheck) {
    try {
      const users = await UserModel.query('username').eq(username).exec();
      const user = users.length > 0 ? users[0] : null;
      if (user) {
        const quotas = JSON.parse(process.env.CHAT_QUOTA || '[20, 1500, 7500, 15000]');
        const userQuota = quotas[user.tier || 0];
        if (user.chat_usage >= userQuota) {
          throw Object.assign(
            new Error('Chat quota exceeded. Please upgrade your plan.'),
            { statusCode: 429, code: 'QUOTA_EXCEEDED' },
          );
        }
      }
    } catch (err: any) {
      // Re-throw quota errors, swallow lookup failures
      if (err.code === 'QUOTA_EXCEEDED') throw err;
      console.warn(`Quota check failed for ${username}:`, err.message);
    }
  }

  // ----------------------------------------------------------
  // Step 2.5 (pre): Text-to-SQL intent detection
  // ----------------------------------------------------------
  // Attempt before cache check so DB answers are always live (not cached).
  // runTextToSQL returns null if no DB connections exist or intent is RAG.
  const openaiForSQL = getOpenAI();
  const modelForSQL = await getChatbotModel(chatbotId);

  const textToSqlResult = await runTextToSQL(
    chatbotId,
    query,
    openaiForSQL,
    modelForSQL,
    options.conversationHistory?.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ).catch((err) => {
    console.warn(`[${channel}] Text-to-SQL error (falling through to RAG):`, err.message);
    return null;
  });

  if (textToSqlResult) {
    const queryLogId =
      new Date().toISOString().slice(0, -5) + '#' + Math.random().toString(36).slice(2, 9);

    fireAndForget(async () => {
      const queryLog = new QueryLogModel({
        uniqueTimestamp: queryLogId,
        passageIndex: chatbotId,
        query,
        answer: textToSqlResult.answer,
        sessionId,
        duration: textToSqlResult.duration,
      });
      await queryLog.save();
    }, `[${channel}] queryLog.save (database)`);

    if (username) {
      fireAndForget(async () => {
        const users = await UserModel.query('username').eq(username).exec();
        if (users.length > 0) {
          users[0].chat_usage = (users[0].chat_usage || 0) + 1;
          await users[0].save();
        }
      }, `[${channel}] user.chat_usage increment (database)`);
    }

    return {
      answer: textToSqlResult.answer,
      citations: [],
      passages: [],
      duration: textToSqlResult.duration,
      sessionId,
      chatbotId,
      model: modelForSQL,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      cached: false,
      queryLogId,
      queryType: 'database' as const,
      executedQuery: textToSqlResult.executedQuery,
      connectionName: textToSqlResult.connectionName,
    };
  }
  // ── End Text-to-SQL ────────────────────────────────────────────────────

  // ----------------------------------------------------------
  // Step 2.5: Check response cache
  // ----------------------------------------------------------
  if (!_skipCache && !stream) {
    const cached = await getCachedResponse(chatbotId, query);
    if (cached) {
      console.log(`[${channel}] Cache hit for chatbot ${chatbotId}`);
      return {
        answer: cached.answer,
        citations: cached.citations,
        passages: [],
        duration: Date.now() - startTime,
        sessionId,
        chatbotId,
        model: cached.model,
        cached: true,
      };
    }
  }

  // ----------------------------------------------------------
  // Step 3: Retrieve RAG passages (hybrid + reranking pipeline)
  // ----------------------------------------------------------
  const indexName = process.env.PINECONE_INDEX || 'corpus-dense';
  let passages: RetrievedPassage[] = [];
  let citations: QueryResult['citations'] = [];

  try {
    // Classify query complexity to choose retrieval strategy
    const queryComplexity = classifyQueryComplexity(query);

    if (queryComplexity === 'complex') {
      passages = await multiQueryRetrieve(indexName, query, {
        topK,
        namespace: chatbotId,
      });
    } else if (queryComplexity === 'vague') {
      passages = await hydeRetrieve(indexName, query, {
        topK,
        minScore,
        namespace: chatbotId,
      });
    } else {
      passages = await hybridRetrievePassages(indexName, query, {
        topK,
        minScore,
        namespace: chatbotId,
        useReranking: true,
        rerankTopN: topK,
      });
    }

    // Fallback to basic retrieval if enhanced pipeline returns empty
    if (passages.length === 0) {
      passages = await retrievePassages(indexName, query, {
        topK,
        minScore: minScore * 0.5, // Lower threshold for fallback
        namespace: chatbotId,
      });
    }

    // Remove near-duplicate passages for diverse context
    passages = getDiversePassages(passages, 0.75);

    citations = extractCitations(passages);
    console.log(`[${channel}] Retrieved ${passages.length} passages (${queryComplexity}) for chatbot ${chatbotId}`);
  } catch (ragError: any) {
    console.warn(`[${channel}] Enhanced RAG retrieval failed, trying basic:`, ragError.message);
    try {
      passages = await retrievePassages(indexName, query, {
        topK,
        minScore,
        namespace: chatbotId,
      });
      passages = getDiversePassages(passages, 0.75);
      citations = extractCitations(passages);
    } catch (fallbackError: any) {
      console.warn(`[${channel}] Basic RAG retrieval also failed:`, fallbackError.message);
    }
  }

  // ----------------------------------------------------------
  // Step 4: Load customization (model + system prompt)
  // ----------------------------------------------------------
  const model = await getChatbotModel(chatbotId);
  let systemPrompt = await getChatbotSystemPrompt(chatbotId, chatbot.title || '');

  if (systemPromptSuffix) {
    systemPrompt += '\n\n' + systemPromptSuffix;
  }

  // ----------------------------------------------------------
  // Step 5: Build messages array
  // ----------------------------------------------------------
  // Build user message with RAG context (system prompt is already in the system message)
  const augmentedPrompt = passages.length > 0
    ? buildRAGPrompt(query, passages)
    : query;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: augmentedPrompt });

  // ----------------------------------------------------------
  // Step 6: Call OpenAI
  // ----------------------------------------------------------
  const openai = getOpenAI();
  let answer: string;
  let usage: OpenAI.CompletionUsage | undefined;

  if (stream && onChunk) {
    const openaiStream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    let fullAnswer = '';
    let chunkIndex = 0;

    for await (const chunk of openaiStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullAnswer += content;
        chunkIndex++;
        await onChunk(content, chunkIndex);
      }
    }

    answer = fullAnswer;
    usage = undefined; // not available in streaming mode by default
  } else {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    answer = completion.choices[0]?.message?.content
      || 'I apologize, but I could not generate a response.';
    usage = completion.usage ?? undefined;
  }

  const duration = Date.now() - startTime;

  // ----------------------------------------------------------
  // Step 7: Log query + increment usage (fire-and-forget, non-blocking)
  // ----------------------------------------------------------
  // Generate a predictable ID upfront so the caller has it immediately.
  // Format must match uniqueTimestamp() — ISO prefix + "#" + random suffix —
  // because analytics queries use ISO string range comparisons on the sort key.
  const queryLogId = new Date().toISOString().slice(0, -5) + '#' + Math.random().toString(36).slice(2, 9);

  fireAndForget(async () => {
    const queryLog = new QueryLogModel({
      uniqueTimestamp: queryLogId,
      passageIndex: chatbotId,
      query,
      answer,
      sessionId,
      duration,
    });
    await queryLog.save();
  }, `[${channel}] queryLog.save`);

  if (username) {
    fireAndForget(async () => {
      const users = await UserModel.query('username').eq(username).exec();
      if (users.length > 0) {
        users[0].chat_usage = (users[0].chat_usage || 0) + 1;
        await users[0].save();
      }
    }, `[${channel}] user.chat_usage increment`);
  }

  // Write to response cache (fire-and-forget)
  if (!_skipCache && !stream) {
    fireAndForget(async () => {
      await setCachedResponse(chatbotId, query, {
        answer,
        citations,
        model,
      });
    }, `[${channel}] response cache write`);
  }

  // ----------------------------------------------------------
  // Return result
  // ----------------------------------------------------------
  return {
    answer,
    citations,
    passages,
    duration,
    sessionId,
    chatbotId,
    model,
    usage,
    cached: false,
    queryLogId,
  };
}
