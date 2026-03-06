import { decrypt } from '../crypto';
import type { DecryptedDbConfig } from './types';

export interface ExecutionResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  duration: number;
}

const QUERY_TIMEOUT = 15_000;
const MAX_ROWS = 50;

export function decryptConnectionConfig(conn: any): DecryptedDbConfig {
  return {
    id: conn.id,
    dbType: conn.dbType,
    name: conn.name,
    host: decrypt(conn.host),
    port: conn.port,
    database: decrypt(conn.database),
    username: decrypt(conn.username),
    password: decrypt(conn.password),
    selectedTables: conn.selectedTables || [],
    schemaDoc: conn.schemaDoc || '',
    sslEnabled: conn.sslEnabled,
    sslCaCert: conn.sslCaCert ? decrypt(conn.sslCaCert) : undefined,
    sslClientCert: conn.sslClientCert ? decrypt(conn.sslClientCert) : undefined,
    sslClientKey: conn.sslClientKey ? decrypt(conn.sslClientKey) : undefined,
    sslRejectUnauthorized: conn.sslRejectUnauthorized,
    mssqlEncrypt: conn.mssqlEncrypt,
    mssqlTrustServerCert: conn.mssqlTrustServerCert,
    mongoAuthSource: conn.mongoAuthSource,
    mongoConnectionString: conn.mongoConnectionString
      ? decrypt(conn.mongoConnectionString)
      : undefined,
  };
}

async function executePostgres(config: DecryptedDbConfig, query: string): Promise<ExecutionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Client } = require('pg');
  const ssl = config.sslEnabled
    ? {
        rejectUnauthorized: config.sslRejectUnauthorized ?? true,
        ...(config.sslCaCert ? { ca: config.sslCaCert } : {}),
        ...(config.sslClientCert ? { cert: config.sslClientCert } : {}),
        ...(config.sslClientKey ? { key: config.sslClientKey } : {}),
      }
    : undefined;
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectionTimeoutMillis: QUERY_TIMEOUT,
    ssl,
    statement_timeout: QUERY_TIMEOUT,
  });
  const start = Date.now();
  await client.connect();
  try {
    const result = await client.query(query);
    return {
      rows: result.rows.slice(0, MAX_ROWS),
      rowCount: result.rowCount ?? result.rows.length,
      duration: Date.now() - start,
    };
  } finally {
    await client.end().catch(() => {});
  }
}

async function executeMySQL(config: DecryptedDbConfig, query: string): Promise<ExecutionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mysql = require('mysql2/promise');
  const ssl = config.sslEnabled
    ? {
        rejectUnauthorized: config.sslRejectUnauthorized ?? true,
        ...(config.sslCaCert ? { ca: config.sslCaCert } : {}),
        ...(config.sslClientCert ? { cert: config.sslClientCert } : {}),
        ...(config.sslClientKey ? { key: config.sslClientKey } : {}),
      }
    : undefined;
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectTimeout: QUERY_TIMEOUT,
    ssl,
    timeout: QUERY_TIMEOUT,
  });
  const start = Date.now();
  try {
    const [rows] = await conn.query(query);
    const arr = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
    return { rows: arr.slice(0, MAX_ROWS), rowCount: arr.length, duration: Date.now() - start };
  } finally {
    await conn.end().catch(() => {});
  }
}

async function executeMSSQL(config: DecryptedDbConfig, query: string): Promise<ExecutionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mssql = require('mssql');
  const pool = await mssql.connect({
    server: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    options: {
      encrypt: config.mssqlEncrypt ?? false,
      trustServerCertificate: config.mssqlTrustServerCert ?? true,
    },
    connectionTimeout: QUERY_TIMEOUT,
    requestTimeout: QUERY_TIMEOUT,
  });
  const start = Date.now();
  try {
    const result = await pool.request().query(query);
    return {
      rows: result.recordset.slice(0, MAX_ROWS),
      rowCount: result.recordset.length,
      duration: Date.now() - start,
    };
  } finally {
    await pool.close().catch(() => {});
  }
}

async function executeMongo(config: DecryptedDbConfig, query: string): Promise<ExecutionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MongoClient } = require('mongodb');
  const uri =
    config.mongoConnectionString ||
    `mongodb://${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}${config.mongoAuthSource ? `?authSource=${encodeURIComponent(config.mongoAuthSource)}` : ''}`;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: QUERY_TIMEOUT,
    connectTimeoutMS: QUERY_TIMEOUT,
  });
  const start = Date.now();
  await client.connect();
  try {
    // query is JSON string: { collection, filter, projection, sort, limit } or { collection, pipeline }
    const parsed = JSON.parse(query);
    const dbName = config.mongoConnectionString ? undefined : config.database;
    const db = client.db(dbName);
    let rows: Record<string, unknown>[];
    if (parsed.pipeline) {
      // Aggregation
      rows = await db
        .collection(parsed.collection)
        .aggregate(parsed.pipeline)
        .limit(MAX_ROWS)
        .toArray();
    } else {
      rows = await db
        .collection(parsed.collection)
        .find(parsed.filter || {}, { projection: parsed.projection })
        .sort(parsed.sort || {})
        .limit(Math.min(parsed.limit || MAX_ROWS, MAX_ROWS))
        .toArray();
    }
    // Remove _id ObjectId (not JSON serializable cleanly)
    const cleaned = rows.map(({ _id, ...rest }: any) => rest as Record<string, unknown>);
    return { rows: cleaned, rowCount: cleaned.length, duration: Date.now() - start };
  } finally {
    await client.close().catch(() => {});
  }
}

export async function executeQuery(
  config: DecryptedDbConfig,
  query: string,
): Promise<ExecutionResult> {
  switch (config.dbType) {
    case 'postgresql':
      return executePostgres(config, query);
    case 'mysql':
      return executeMySQL(config, query);
    case 'mssql':
      return executeMSSQL(config, query);
    case 'mongodb':
      return executeMongo(config, query);
    default:
      throw new Error(`Unsupported database type: ${(config as any).dbType}`);
  }
}
