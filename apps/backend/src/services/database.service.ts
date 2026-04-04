export interface SslConfig {
  enabled: boolean;
  ca?: string;
  cert?: string;
  key?: string;
  rejectUnauthorized?: boolean;
}

export interface DbConnectionConfig {
  dbType: 'postgresql' | 'mysql' | 'mssql' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  // SSL — MySQL, PostgreSQL
  ssl?: SslConfig;
  // MSSQL
  mssqlEncrypt?: boolean;
  mssqlTrustServerCert?: boolean;
  // MongoDB
  mongoAuthSource?: string;
  mongoConnectionString?: string;
}

const CONNECT_TIMEOUT = 10_000;

/**
 * Test a database connection by running a simple query.
 */
export async function testConnection(config: DbConnectionConfig): Promise<{ success: boolean; error?: string }> {
  try {
    switch (config.dbType) {
      case 'postgresql':
        return await testPostgres(config);
      case 'mysql':
        return await testMySQL(config);
      case 'mssql':
        return await testMSSQL(config);
      case 'mongodb':
        return await testMongo(config);
      default:
        return { success: false, error: `Unsupported database type: ${config.dbType}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown connection error' };
  }
}

/**
 * Fetch table/collection names from a database.
 */
export async function fetchTables(config: DbConnectionConfig): Promise<{ tables: string[]; error?: string }> {
  try {
    switch (config.dbType) {
      case 'postgresql':
        return await fetchPostgresTables(config);
      case 'mysql':
        return await fetchMySQLTables(config);
      case 'mssql':
        return await fetchMSSQLTables(config);
      case 'mongodb':
        return await fetchMongoCollections(config);
      default:
        return { tables: [], error: `Unsupported database type: ${config.dbType}` };
    }
  } catch (err: any) {
    return { tables: [], error: err.message || 'Unknown error fetching tables' };
  }
}

// ─── PostgreSQL ──────────────────────────────────────────────────────────────

function buildPostgresSslOptions(ssl?: SslConfig): object | boolean | undefined {
  if (!ssl?.enabled) return undefined;
  return {
    rejectUnauthorized: ssl.rejectUnauthorized ?? true,
    ...(ssl.ca ? { ca: ssl.ca } : {}),
    ...(ssl.cert ? { cert: ssl.cert } : {}),
    ...(ssl.key ? { key: ssl.key } : {}),
  };
}

async function testPostgres(config: DbConnectionConfig) {
  const { Client } = await import('pg');
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectionTimeoutMillis: CONNECT_TIMEOUT,
    ssl: buildPostgresSslOptions(config.ssl),
  });
  try {
    await client.connect();
    await client.query('SELECT 1');
    return { success: true };
  } finally {
    await client.end().catch(() => {});
  }
}

async function fetchPostgresTables(config: DbConnectionConfig) {
  const { Client } = await import('pg');
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectionTimeoutMillis: CONNECT_TIMEOUT,
    ssl: buildPostgresSslOptions(config.ssl),
  });
  try {
    await client.connect();
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    return { tables: result.rows.map((r: any) => r.table_name) };
  } finally {
    await client.end().catch(() => {});
  }
}

// ─── MySQL ───────────────────────────────────────────────────────────────────

function buildMySqlSslOptions(ssl?: SslConfig): object | undefined {
  if (!ssl?.enabled) return undefined;
  return {
    rejectUnauthorized: ssl.rejectUnauthorized ?? true,
    ...(ssl.ca ? { ca: ssl.ca } : {}),
    ...(ssl.cert ? { cert: ssl.cert } : {}),
    ...(ssl.key ? { key: ssl.key } : {}),
  };
}

async function testMySQL(config: DbConnectionConfig) {
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectTimeout: CONNECT_TIMEOUT,
    ssl: buildMySqlSslOptions(config.ssl),
  });
  try {
    await conn.query('SELECT 1');
    return { success: true };
  } finally {
    await conn.end().catch(() => {});
  }
}

async function fetchMySQLTables(config: DbConnectionConfig) {
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectTimeout: CONNECT_TIMEOUT,
    ssl: buildMySqlSslOptions(config.ssl),
  });
  try {
    const [rows] = await conn.query('SHOW TABLES');
    const tables = (rows as any[]).map((row: any) => Object.values(row)[0] as string);
    return { tables };
  } finally {
    await conn.end().catch(() => {});
  }
}

// ─── MS SQL Server ───────────────────────────────────────────────────────────

async function testMSSQL(config: DbConnectionConfig) {
  const mssql = await import('mssql');
  const pool = await mssql.default.connect({
    server: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    options: {
      encrypt: config.mssqlEncrypt ?? false,
      trustServerCertificate: config.mssqlTrustServerCert ?? true,
    },
    connectionTimeout: CONNECT_TIMEOUT,
    requestTimeout: CONNECT_TIMEOUT,
  });
  try {
    await pool.request().query('SELECT 1');
    return { success: true };
  } finally {
    await pool.close().catch(() => {});
  }
}

async function fetchMSSQLTables(config: DbConnectionConfig) {
  const mssql = await import('mssql');
  const pool = await mssql.default.connect({
    server: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    options: {
      encrypt: config.mssqlEncrypt ?? false,
      trustServerCertificate: config.mssqlTrustServerCert ?? true,
    },
    connectionTimeout: CONNECT_TIMEOUT,
    requestTimeout: CONNECT_TIMEOUT,
  });
  try {
    const result = await pool.request().query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
    );
    return { tables: result.recordset.map((r: any) => r.TABLE_NAME) };
  } finally {
    await pool.close().catch(() => {});
  }
}

// ─── MongoDB ─────────────────────────────────────────────────────────────────

function buildMongoUri(config: DbConnectionConfig): string {
  const user = encodeURIComponent(config.username);
  const pass = encodeURIComponent(config.password);
  const authSource = config.mongoAuthSource ? `?authSource=${encodeURIComponent(config.mongoAuthSource)}` : '';
  return `mongodb://${user}:${pass}@${config.host}:${config.port}/${config.database}${authSource}`;
}

async function testMongo(config: DbConnectionConfig) {
  const { MongoClient } = await import('mongodb');
  // Use provided connection string (Atlas / custom URI) or build from fields
  const uri = config.mongoConnectionString || buildMongoUri(config);
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: CONNECT_TIMEOUT,
    connectTimeoutMS: CONNECT_TIMEOUT,
  });
  try {
    await client.connect();
    // For Atlas/SRV URIs the database may be embedded in the URI; fall back to config.database
    const dbName = config.mongoConnectionString ? undefined : config.database;
    await client.db(dbName).command({ ping: 1 });
    return { success: true };
  } finally {
    await client.close().catch(() => {});
  }
}

async function fetchMongoCollections(config: DbConnectionConfig) {
  const { MongoClient } = await import('mongodb');
  const uri = config.mongoConnectionString || buildMongoUri(config);
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: CONNECT_TIMEOUT,
    connectTimeoutMS: CONNECT_TIMEOUT,
  });
  try {
    await client.connect();
    const dbName = config.mongoConnectionString ? undefined : config.database;
    const collections = await client.db(dbName).listCollections().toArray();
    return { tables: collections.map((c) => c.name).sort() };
  } finally {
    await client.close().catch(() => {});
  }
}

// ─── Schema Introspection ─────────────────────────────────────────────────────

/**
 * Introspect schema for selected tables from a database connection.
 * Returns a JSON string of DatabaseSchema for storage in DynamoDB schemaDoc field.
 */
export async function introspectSchema(
  config: DbConnectionConfig,
  connectionId: string,
  connectionName: string,
  selectedTables: string[],
): Promise<string> {
  switch (config.dbType) {
    case 'postgresql':
      return introspectPostgresSchema(config, connectionId, connectionName, selectedTables);
    case 'mysql':
      return introspectMySQLSchema(config, connectionId, connectionName, selectedTables);
    case 'mssql':
      return introspectMSSQLSchema(config, connectionId, connectionName, selectedTables);
    case 'mongodb':
      return introspectMongoSchema(config, connectionId, connectionName, selectedTables);
    default:
      throw new Error(`Unsupported database type: ${config.dbType}`);
  }
}

async function introspectPostgresSchema(
  config: DbConnectionConfig,
  connectionId: string,
  connectionName: string,
  selectedTables: string[],
): Promise<string> {
  const { Client } = await import('pg');
  const ssl = buildPostgresSslOptions(config.ssl);
  const client = new Client({
    host: config.host, port: config.port, database: config.database,
    user: config.username, password: config.password,
    connectionTimeoutMillis: CONNECT_TIMEOUT, ssl,
    statement_timeout: 20000,
  });
  await client.connect();
  try {
    const tableFilter = selectedTables.length > 0
      ? `AND table_name = ANY($1::text[])`
      : '';
    const params = selectedTables.length > 0 ? [selectedTables] : [];

    const colResult = await client.query(
      `SELECT
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        CASE WHEN kcu.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN information_schema.table_constraints tc
        ON tc.table_name = c.table_name AND tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
      LEFT JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.column_name = c.column_name
      WHERE c.table_schema = 'public' ${tableFilter}
      ORDER BY c.table_name, c.ordinal_position`,
      params,
    );

    const tableMap: Record<string, any> = {};
    for (const row of colResult.rows) {
      if (!tableMap[row.table_name]) {
        tableMap[row.table_name] = { name: row.table_name, columns: [] };
      }
      tableMap[row.table_name].columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        primaryKey: row.is_primary_key,
      });
    }

    const schema = {
      connectionId,
      connectionName,
      dbType: 'postgresql',
      tables: Object.values(tableMap),
    };
    return JSON.stringify(schema);
  } finally {
    await client.end().catch(() => {});
  }
}

async function introspectMySQLSchema(
  config: DbConnectionConfig,
  connectionId: string,
  connectionName: string,
  selectedTables: string[],
): Promise<string> {
  const mysql = await import('mysql2/promise');
  const ssl = buildMySqlSslOptions(config.ssl);
  const conn = await mysql.createConnection({
    host: config.host, port: config.port, database: config.database,
    user: config.username, password: config.password,
    connectTimeout: CONNECT_TIMEOUT, ssl,
  });
  try {
    const tableFilter = selectedTables.length > 0
      ? `AND TABLE_NAME IN (${selectedTables.map(() => '?').join(',')})`
      : '';
    const params: string[] = [config.database, ...selectedTables];

    const [rows] = await conn.query(
      `SELECT
        c.TABLE_NAME as table_name,
        c.COLUMN_NAME as column_name,
        c.DATA_TYPE as data_type,
        c.IS_NULLABLE as is_nullable,
        CASE WHEN c.COLUMN_KEY = 'PRI' THEN 1 ELSE 0 END as is_primary_key
      FROM information_schema.COLUMNS c
      WHERE c.TABLE_SCHEMA = ? ${tableFilter}
      ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION`,
      params,
    );

    const tableMap: Record<string, any> = {};
    for (const row of rows as any[]) {
      if (!tableMap[row.table_name]) {
        tableMap[row.table_name] = { name: row.table_name, columns: [] };
      }
      tableMap[row.table_name].columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        primaryKey: row.is_primary_key === 1,
      });
    }

    const schema = {
      connectionId,
      connectionName,
      dbType: 'mysql',
      tables: Object.values(tableMap),
    };
    return JSON.stringify(schema);
  } finally {
    await conn.end().catch(() => {});
  }
}

async function introspectMSSQLSchema(
  config: DbConnectionConfig,
  connectionId: string,
  connectionName: string,
  selectedTables: string[],
): Promise<string> {
  const mssql = await import('mssql');
  const pool = await mssql.default.connect({
    server: config.host, port: config.port, database: config.database,
    user: config.username, password: config.password,
    options: { encrypt: config.mssqlEncrypt ?? false, trustServerCertificate: config.mssqlTrustServerCert ?? true },
    connectionTimeout: CONNECT_TIMEOUT, requestTimeout: 20000,
  });
  try {
    const tableFilter = selectedTables.length > 0
      ? `AND c.TABLE_NAME IN (${selectedTables.map((t) => `'${t.replace(/'/g, "''")}'`).join(',')})`
      : '';

    const result = await pool.request().query(`
      SELECT
        c.TABLE_NAME as table_name,
        c.COLUMN_NAME as column_name,
        c.DATA_TYPE as data_type,
        c.IS_NULLABLE as is_nullable,
        CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as is_primary_key
      FROM INFORMATION_SCHEMA.COLUMNS c
      LEFT JOIN (
        SELECT ku.TABLE_NAME, ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
          ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
      ) pk ON pk.TABLE_NAME = c.TABLE_NAME AND pk.COLUMN_NAME = c.COLUMN_NAME
      WHERE c.TABLE_SCHEMA = 'dbo' ${tableFilter}
      ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION
    `);

    const tableMap: Record<string, any> = {};
    for (const row of result.recordset) {
      if (!tableMap[row.table_name]) {
        tableMap[row.table_name] = { name: row.table_name, columns: [] };
      }
      tableMap[row.table_name].columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        primaryKey: row.is_primary_key === 1,
      });
    }

    const schema = {
      connectionId,
      connectionName,
      dbType: 'mssql',
      tables: Object.values(tableMap),
    };
    return JSON.stringify(schema);
  } finally {
    await pool.close().catch(() => {});
  }
}

async function introspectMongoSchema(
  config: DbConnectionConfig,
  connectionId: string,
  connectionName: string,
  selectedCollections: string[],
): Promise<string> {
  const { MongoClient } = await import('mongodb');
  const uri = config.mongoConnectionString
    || `mongodb://${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}${config.mongoAuthSource ? `?authSource=${encodeURIComponent(config.mongoAuthSource)}` : ''}`;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: CONNECT_TIMEOUT, connectTimeoutMS: CONNECT_TIMEOUT });
  await client.connect();
  try {
    const dbName = config.mongoConnectionString ? undefined : config.database;
    const db = client.db(dbName);

    const collectionNames = selectedCollections.length > 0
      ? selectedCollections
      : (await db.listCollections().toArray()).map((c) => c.name);

    const tables = await Promise.all(
      collectionNames.map(async (collName) => {
        const docs = await db.collection(collName).find().limit(10).toArray();
        const fieldTypes: Record<string, string> = {};
        for (const doc of docs) {
          for (const [key, val] of Object.entries(doc)) {
            if (key === '_id') continue;
            fieldTypes[key] = inferMongoType(val);
          }
        }
        const columns = Object.entries(fieldTypes).map(([name, type]) => ({
          name, type, nullable: true,
        }));
        return { name: collName, columns };
      })
    );

    const schema = { connectionId, connectionName, dbType: 'mongodb', tables };
    return JSON.stringify(schema);
  } finally {
    await client.close().catch(() => {});
  }
}

function inferMongoType(val: unknown): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'string') return 'string';
  if (typeof val === 'number') return Number.isInteger(val) ? 'integer' : 'double';
  if (typeof val === 'boolean') return 'boolean';
  if (val instanceof Date) return 'date';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'object') return 'object';
  return 'unknown';
}
