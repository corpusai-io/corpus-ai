import OpenAI from 'openai';
import type { ExecutionResult } from './executor';

export async function formatResults(
  userQuery: string,
  executedQuery: string,
  queryType: 'sql' | 'mql',
  result: ExecutionResult,
  openai: OpenAI,
  model: string,
): Promise<string> {
  if (result.rows.length === 0) {
    return `I searched the database but found no records matching your query.`;
  }

  // For very small result sets, format as a simple list
  const dataPreview = JSON.stringify(result.rows.slice(0, 20), null, 2);
  const truncated = result.rowCount > 20 ? `\n(showing 20 of ${result.rowCount} results)` : '';

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content: `You are a data analyst assistant. Convert database query results into clear, well-structured answers.

Formatting rules:
- For single values or aggregates (count, sum, avg): Answer directly in 1 sentence, bold the key number/value. Example: "**42** users signed up this month."
- For lists of 1-2 columns: Use a numbered or bulleted list.
- For tables with 3+ columns: ALWAYS use a markdown table with headers.
- For large result sets: Show the table then add a summary sentence at the end.
- Format currency with $ and 2 decimal places. Format large numbers with commas.
- Never say "the database returned" or mention technical details. Just answer naturally.
- Never fabricate data not in the results.`,
      },
      {
        role: 'user',
        content: `User asked: "${userQuery}"\n\nResults (${result.rowCount} record${result.rowCount !== 1 ? 's' : ''}):\n${dataPreview}${truncated}\n\nProvide a well-formatted answer.`,
      },
    ],
  });

  return (
    response.choices[0]?.message?.content?.trim() ||
    `Found ${result.rowCount} records in the database.`
  );
}
