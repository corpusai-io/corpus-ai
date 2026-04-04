const FORBIDDEN_SQL_PATTERNS = [
  /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|REPLACE|MERGE|EXECUTE|EXEC)\b/i,
  /;.*\b(SELECT|INSERT|UPDATE|DELETE)\b/i, // SQL injection via stacked queries
  /--/,                                      // SQL comment (injection attempt)
  /\/\*/,                                    // Block comment
  /xp_cmdshell/i,
  /INFORMATION_SCHEMA\./i,                   // Schema probing
  /sys\./i,
];

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateSqlQuery(query: string, allowedTables: string[]): void {
  if (!query?.trim()) throw new ValidationError('Empty query generated');

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_SQL_PATTERNS) {
    if (pattern.test(query)) {
      throw new ValidationError(`Query contains forbidden pattern: ${pattern.source}`);
    }
  }

  // Must be a SELECT statement
  if (!/^\s*SELECT\b/i.test(query)) {
    throw new ValidationError('Only SELECT queries are allowed');
  }

  // Must have LIMIT
  if (!/\bLIMIT\s+\d+/i.test(query)) {
    throw new ValidationError('Query must include LIMIT clause');
  }

  // Check LIMIT value doesn't exceed 200
  const limitMatch = query.match(/\bLIMIT\s+(\d+)/i);
  if (limitMatch && parseInt(limitMatch[1], 10) > 200) {
    throw new ValidationError('LIMIT exceeds maximum of 200 rows');
  }

  // If allowed tables list is provided, check referenced tables
  if (allowedTables.length > 0) {
    const queryLower = query.toLowerCase();
    const referencedTables = allowedTables.filter((t) => {
      const tablePattern = new RegExp(`\\b${t.toLowerCase()}\\b`);
      return tablePattern.test(queryLower);
    });
    // At least one allowed table must be referenced
    if (referencedTables.length === 0) {
      throw new ValidationError(
        `Query must reference at least one of the allowed tables: ${allowedTables.join(', ')}`,
      );
    }
  }
}

export function injectLimit(query: string, maxRows = 50): string {
  if (/\bLIMIT\s+\d+/i.test(query)) return query;
  return `${query.trimEnd().replace(/;$/, '')} LIMIT ${maxRows}`;
}
