import OpenAI from 'openai';

// Keywords that strongly suggest a database/data query
const DB_KEYWORDS = [
  /\bhow many\b/i,
  /\bcount\b/i,
  /\blist all\b/i,
  /\bshow (me )?(all |the )?\w/i,
  /\btotal\b/i,
  /\baverage\b/i,
  /\bsum of\b/i,
  /\border by\b/i,
  /\bsort by\b/i,
  /\blatest\b/i,
  /\bmost recent\b/i,
  /\boldest\b/i,
  /\btop \d+\b/i,
  /\bfilter\b/i,
  /\bwhere\b/i,
  /\bgroup by\b/i,
  /\brecords?\b/i,
  /\brows?\b/i,
  /\bentries\b/i,
  /\bdatabase\b/i,
  /\btable\b/i,
];

// Keywords that strongly suggest a knowledge/RAG query
const RAG_KEYWORDS = [
  /\bwhat is\b/i,
  /\bexplain\b/i,
  /\bhow (does|do|to)\b/i,
  /\btell me about\b/i,
  /\bdescribe\b/i,
  /\bsummarize\b/i,
];

export type IntentType = 'database' | 'rag' | 'ambiguous';

export interface IntentResult {
  intent: IntentType;
  confidence: number; // 0.0 - 1.0
  matchedTableNames: string[];
}

export function detectIntentByKeyword(query: string, tableNames: string[]): IntentResult {
  const dbScore = DB_KEYWORDS.filter((r) => r.test(query)).length;
  const ragScore = RAG_KEYWORDS.filter((r) => r.test(query)).length;

  // Check if query mentions any table names
  const lowerQuery = query.toLowerCase();
  const matchedTableNames = tableNames.filter((t) => lowerQuery.includes(t.toLowerCase()));
  const tableBonus = matchedTableNames.length > 0 ? 2 : 0;

  const totalDbScore = dbScore + tableBonus;
  const total = totalDbScore + ragScore || 1;
  const dbConfidence = totalDbScore / total;

  if (dbConfidence >= 0.7) return { intent: 'database', confidence: dbConfidence, matchedTableNames };
  if (dbConfidence <= 0.3 && ragScore > 0) return { intent: 'rag', confidence: 1 - dbConfidence, matchedTableNames };
  return { intent: 'ambiguous', confidence: dbConfidence, matchedTableNames };
}

export async function detectIntentWithLLM(
  query: string,
  tableNames: string[],
  openai: OpenAI,
  model: string,
): Promise<IntentResult> {
  const tableList = tableNames.slice(0, 20).join(', ');
  const response = await openai.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 50,
    messages: [
      {
        role: 'system',
        content: `You are an intent classifier. Given a user query and available database tables, classify whether the query should be answered by querying the database or by searching knowledge base documents.

Available tables: ${tableList || 'none specified'}

Respond with ONLY a JSON object: {"intent": "database" | "rag", "confidence": 0.0-1.0}`,
      },
      { role: 'user', content: query },
    ],
  });

  try {
    const text = response.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(text);
    return {
      intent: parsed.intent === 'database' ? 'database' : 'rag',
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
      matchedTableNames: [],
    };
  } catch {
    return { intent: 'rag', confidence: 0.5, matchedTableNames: [] };
  }
}

export async function detectIntent(
  query: string,
  tableNames: string[],
  openai: OpenAI,
  model: string,
): Promise<IntentResult> {
  const keywordResult = detectIntentByKeyword(query, tableNames);
  if (keywordResult.intent !== 'ambiguous') return keywordResult;
  // Only call LLM when keyword result is ambiguous (saves cost)
  return detectIntentWithLLM(query, tableNames, openai, model);
}
