import OpenAI from 'openai';
import type { DatabaseSchema } from './types';

export interface GeneratedQuery {
  query: string;
  queryType: 'sql' | 'mql';
  confidence: number; // 0.0 - 1.0
  explanation: string;
}

function buildSchemaPrompt(schema: DatabaseSchema): string {
  const tables = schema.tables.map((t) => {
    const cols = t.columns
      .map(
        (c) =>
          `  ${c.name} ${c.type}${c.primaryKey ? ' PRIMARY KEY' : ''}${c.nullable ? '' : ' NOT NULL'}`,
      )
      .join('\n');
    return `Table: ${t.name}\n(\n${cols}\n)`;
  }).join('\n\n');
  return tables;
}

function buildMongoSchemaPrompt(schema: DatabaseSchema): string {
  return schema.tables
    .map((t) => {
      const fields = t.columns.map((c) => `  ${c.name}: ${c.type}`).join('\n');
      return `Collection: ${t.name}\n{\n${fields}\n}`;
    })
    .join('\n\n');
}

export async function generateQuery(
  userQuery: string,
  schema: DatabaseSchema,
  openai: OpenAI,
  model: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  previousError?: string,
): Promise<GeneratedQuery> {
  const isMongo = schema.dbType === 'mongodb';
  const schemaText = isMongo ? buildMongoSchemaPrompt(schema) : buildSchemaPrompt(schema);

  const errorHint = previousError
    ? `\n\nPrevious query failed with error: ${previousError}\nPlease fix the query.`
    : '';

  const systemPrompt = isMongo
    ? `You are an expert MongoDB query generator. Given a natural language question and MongoDB schema, generate a MongoDB aggregation pipeline or find query.

Schema:
${schemaText}

Rules:
- Return ONLY a JSON object: {"query": "<MQL as JSON string>", "confidence": 0.0-1.0, "explanation": "<brief>"}
- Use aggregation pipeline [$match, $group, $sort, $limit, $project] for complex queries
- For simple lookups use find() syntax as JSON: {"filter": {...}, "projection": {...}, "sort": {...}, "limit": N}
- Collection name must be one of the schema collections
- ALWAYS add a limit of 50 to prevent large result sets
- If uncertain, set confidence < 0.7${errorHint}`
    : `You are an expert SQL query generator. Given a natural language question and database schema, generate a safe read-only SQL SELECT query.

Schema:
${schemaText}

Rules:
- Return ONLY a JSON object: {"query": "<SQL>", "confidence": 0.0-1.0, "explanation": "<brief>"}
- Only generate SELECT queries — NEVER INSERT, UPDATE, DELETE, DROP, TRUNCATE, or DDL
- ALWAYS add LIMIT 50 to prevent large result sets (unless user asks for specific count)
- Use table names exactly as shown in the schema
- If the question cannot be answered with the given schema, set confidence to 0.0 and explain why
- If uncertain, set confidence < 0.7${errorHint}`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Include last 3 turns of conversation for context
  if (conversationHistory?.length) {
    const recent = conversationHistory.slice(-3);
    messages.push(
      ...recent.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    );
  }

  messages.push({ role: 'user', content: userQuery });

  const response = await openai.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 800,
    messages,
  });

  try {
    const text = response.choices[0]?.message?.content?.trim() || '{}';
    // Strip markdown code blocks if present
    const cleaned = text
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    return {
      query: parsed.query || '',
      queryType: isMongo ? 'mql' : 'sql',
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
      explanation: parsed.explanation || '',
    };
  } catch {
    return {
      query: '',
      queryType: isMongo ? 'mql' : 'sql',
      confidence: 0,
      explanation: 'Failed to parse LLM response',
    };
  }
}
