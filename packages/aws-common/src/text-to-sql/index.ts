import OpenAI from 'openai';
import { DatabaseConnectionModel } from '../dynamo-models/database-connection.model';
import { detectIntent } from './intent';
import { generateQuery } from './generator';
import { validateSqlQuery, injectLimit } from './validator';
import { executeQuery, decryptConnectionConfig } from './executor';
import { formatResults } from './formatter';
import type { DatabaseSchema, TextToSqlResult } from './types';

export type { TextToSqlResult, DatabaseSchema, DecryptedDbConfig } from './types';
export { detectIntent } from './intent';

const CONFIDENCE_THRESHOLD = 0.70;

function parseSchemaDoc(schemaDoc: string): DatabaseSchema | null {
  try {
    return JSON.parse(schemaDoc) as DatabaseSchema;
  } catch {
    return null;
  }
}

/**
 * Run the full Text-to-SQL pipeline for a chatbot.
 * 1. Load DB connections for the chatbot
 * 2. Detect intent (database vs RAG)
 * 3. Generate SQL/MQL
 * 4. Validate (SQL only)
 * 5. Execute with 1-retry loop
 * 6. Format results as natural language
 *
 * Returns null if no DB connections exist or intent is not database.
 */
export async function runTextToSQL(
  chatbotId: string,
  userQuery: string,
  openai: OpenAI,
  model: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<TextToSqlResult | null> {
  const start = Date.now();

  // 1. Load connections
  const connections = await DatabaseConnectionModel
    .query('chatbotId').eq(chatbotId).using('chatbotId-index').exec();

  if (!connections || connections.length === 0) return null;

  // Build combined table list for intent detection
  const allTableNames: string[] = [];
  for (const conn of connections) {
    if (conn.selectedTables?.length) allTableNames.push(...conn.selectedTables);
  }

  // 2. Detect intent
  const intentResult = await detectIntent(userQuery, allTableNames, openai, model);
  if (intentResult.intent !== 'database') return null;

  // 3. Pick best connection — prefer connections that have matching table names
  let targetConn = connections[0];
  if (intentResult.matchedTableNames.length > 0) {
    const matched = connections.find((c: any) =>
      c.selectedTables?.some((t: string) => intentResult.matchedTableNames.includes(t)),
    );
    if (matched) targetConn = matched;
  }

  if (!targetConn.schemaDoc) return null; // Schema not yet introspected

  const schema = parseSchemaDoc(targetConn.schemaDoc);
  if (!schema) return null;

  const config = decryptConnectionConfig(targetConn);

  // 4. Generate query (with 1-retry on validation/execution error)
  let generated = await generateQuery(userQuery, schema, openai, model, conversationHistory);

  if (generated.confidence < CONFIDENCE_THRESHOLD) return null; // Fall through to RAG

  let executionError: string | undefined;
  let result: Awaited<ReturnType<typeof executeQuery>> | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      let query = generated.query;

      // Validate and sanitize SQL
      if (generated.queryType === 'sql') {
        query = injectLimit(query);
        validateSqlQuery(query, config.selectedTables);
      }

      result = await executeQuery(config, query);
      executionError = undefined;
      break;
    } catch (err: any) {
      executionError = err.message;
      if (attempt === 0) {
        // Retry: regenerate with error context
        generated = await generateQuery(
          userQuery,
          schema,
          openai,
          model,
          conversationHistory,
          executionError,
        );
        if (generated.confidence < CONFIDENCE_THRESHOLD) return null;
      }
    }
  }

  if (!result) return null; // Both attempts failed

  // 5. Format results
  const answer = await formatResults(
    userQuery,
    generated.query,
    generated.queryType,
    result,
    openai,
    model,
  );

  return {
    answer,
    executedQuery: generated.query,
    queryType: generated.queryType,
    rowCount: result.rowCount,
    connectionName: config.name,
    duration: Date.now() - start,
  };
}
