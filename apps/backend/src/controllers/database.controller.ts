import { Response } from 'express';
import { nanoid } from 'nanoid';
import { DatabaseConnectionModel, runTextToSQL } from '@corpusai/aws-common';
import OpenAI from 'openai';
import { AuthRequest } from '../middleware/auth.middleware';
import { testConnection, fetchTables, introspectSchema, DbConnectionConfig } from '../services/database.service';
import { encrypt } from '../utils/encryption';
import { errorResponse, ErrorCodes } from '../utils/error-response';

/** Build a DbConnectionConfig from an Express request body, including SSL/advanced fields. */
function buildConfigFromBody(body: any): DbConnectionConfig {
  const config: DbConnectionConfig = {
    dbType: body.dbType,
    host: body.host,
    port: Number(body.port),
    database: body.database,
    username: body.username,
    password: body.password || '',
  };

  // SSL (MySQL, PostgreSQL)
  if (body.ssl?.enabled) {
    config.ssl = {
      enabled: true,
      rejectUnauthorized: body.ssl.rejectUnauthorized !== false,
      ...(body.ssl.ca ? { ca: body.ssl.ca } : {}),
      ...(body.ssl.cert ? { cert: body.ssl.cert } : {}),
      ...(body.ssl.key ? { key: body.ssl.key } : {}),
    };
  }

  // MSSQL
  if (body.dbType === 'mssql') {
    config.mssqlEncrypt = body.mssqlEncrypt === true;
    config.mssqlTrustServerCert = body.mssqlTrustServerCert !== false;
  }

  // MongoDB
  if (body.dbType === 'mongodb') {
    if (body.mongoConnectionString) {
      config.mongoConnectionString = body.mongoConnectionString;
    } else if (body.mongoAuthSource) {
      config.mongoAuthSource = body.mongoAuthSource;
    }
  }

  return config;
}

/**
 * POST /api/databases/test
 * Test a database connection with the provided credentials.
 */
export async function testDatabaseConnection(req: AuthRequest, res: Response) {
  try {
    const { dbType, host, port, database, username, mongoConnectionString } = req.body;

    // For MongoDB with connection string, host/port/database/username are not required
    const isMongoCstr = dbType === 'mongodb' && mongoConnectionString;
    if (!dbType || (!isMongoCstr && (!host || !port || !database || !username))) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing required fields: dbType, host, port, database, username');
    }

    const config = buildConfigFromBody(req.body);
    const result = await testConnection(config);
    res.json(result);
  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/databases/tables
 * Fetch table/collection names from a database.
 */
export async function fetchDatabaseTables(req: AuthRequest, res: Response) {
  try {
    const { dbType, host, port, database, username, mongoConnectionString } = req.body;

    const isMongoCstr = dbType === 'mongodb' && mongoConnectionString;
    if (!dbType || (!isMongoCstr && (!host || !port || !database || !username))) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing required fields: dbType, host, port, database, username');
    }

    const config = buildConfigFromBody(req.body);
    const result = await fetchTables(config);

    if (result.error) {
      return res.json({ tables: [], error: result.error });
    }

    res.json({ tables: result.tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      tables: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/databases/save
 * Encrypt credentials and save a database connection config to DynamoDB.
 */
export async function saveDatabaseConnection(req: AuthRequest, res: Response) {
  try {
    const {
      chatbotId, dbType, name, host, port, database, username, password, selectedTables,
      // SSL
      ssl,
      // MSSQL
      mssqlEncrypt, mssqlTrustServerCert,
      // MongoDB
      mongoAuthSource, mongoConnectionString,
    } = req.body;

    const isMongoCstr = dbType === 'mongodb' && mongoConnectionString;
    if (!chatbotId || !dbType || (!isMongoCstr && (!host || !port || !database || !username))) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing required fields');
    }

    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const id = `dbc-${nanoid(16)}`;

    const record = new DatabaseConnectionModel({
      id,
      chatbotId,
      userId: req.user.username,
      dbType,
      name: name || database || 'MongoDB',
      host: host ? encrypt(host) : '',
      port: Number(port) || 0,
      database: database ? encrypt(database) : '',
      username: username ? encrypt(username) : '',
      password: encrypt(password || ''),
      selectedTables: selectedTables || [],
      status: 'connected',
      // SSL (MySQL, PostgreSQL) — encrypt sensitive cert material
      sslEnabled: ssl?.enabled === true,
      sslCaCert: ssl?.enabled && ssl?.ca ? encrypt(ssl.ca) : '',
      sslClientCert: ssl?.enabled && ssl?.cert ? encrypt(ssl.cert) : '',
      sslClientKey: ssl?.enabled && ssl?.key ? encrypt(ssl.key) : '',
      sslRejectUnauthorized: ssl?.rejectUnauthorized !== false,
      // MSSQL
      mssqlEncrypt: dbType === 'mssql' ? (mssqlEncrypt === true) : false,
      mssqlTrustServerCert: dbType === 'mssql' ? (mssqlTrustServerCert !== false) : true,
      // MongoDB — encrypt connection string since it contains credentials
      mongoAuthSource: mongoAuthSource || '',
      mongoConnectionString: mongoConnectionString ? encrypt(mongoConnectionString) : '',
    });

    await record.save();

    // Fire-and-forget: introspect schema in background (don't block the API response)
    (async () => {
      try {
        const { decrypt } = await import('../utils/encryption.js');
        const plainConfig: DbConnectionConfig = {
          dbType: record.dbType as DbConnectionConfig['dbType'],
          host: decrypt(record.host),
          port: record.port,
          database: decrypt(record.database),
          username: decrypt(record.username),
          password: decrypt(record.password),
          ...(record.sslEnabled ? {
            ssl: {
              enabled: true,
              rejectUnauthorized: record.sslRejectUnauthorized !== false,
              ...(record.sslCaCert ? { ca: decrypt(record.sslCaCert) } : {}),
              ...(record.sslClientCert ? { cert: decrypt(record.sslClientCert) } : {}),
              ...(record.sslClientKey ? { key: decrypt(record.sslClientKey) } : {}),
            }
          } : {}),
          mssqlEncrypt: record.mssqlEncrypt,
          mssqlTrustServerCert: record.mssqlTrustServerCert,
          mongoAuthSource: record.mongoAuthSource,
          mongoConnectionString: record.mongoConnectionString ? decrypt(record.mongoConnectionString) : undefined,
        };
        const schemaDoc = await introspectSchema(plainConfig, id, name || database || 'MongoDB', selectedTables || []);
        await DatabaseConnectionModel.update({ id }, { schemaDoc, schemaLastSynced: Date.now() });
      } catch (err) {
        console.error(`[schema introspect] Failed for connection ${id}:`, err);
      }
    })();

    res.json({
      success: true,
      connection: {
        id,
        chatbotId,
        dbType,
        name: name || database || 'MongoDB',
        host: '****',
        port: Number(port) || 0,
        database: '****',
        username: '****',
        password: '****',
        selectedTables: selectedTables || [],
        status: 'connected',
        sslEnabled: ssl?.enabled === true,
        mssqlEncrypt: dbType === 'mssql' ? (mssqlEncrypt === true) : false,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving database connection:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/databases/:chatbotId
 * List all saved database connections for a chatbot (credentials masked).
 */
export async function getDatabaseConnections(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!chatbotId) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing chatbotId');
    }

    const connections = await DatabaseConnectionModel.query('chatbotId').eq(chatbotId).using('chatbotId-index').exec();

    const masked = connections.map((conn: any) => ({
      id: conn.id,
      chatbotId: conn.chatbotId,
      dbType: conn.dbType,
      name: conn.name,
      host: '****',
      port: conn.port,
      database: '****',
      username: '****',
      password: '****',
      selectedTables: conn.selectedTables || [],
      status: conn.status,
      sslEnabled: conn.sslEnabled || false,
      mssqlEncrypt: conn.mssqlEncrypt || false,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      schemaLastSynced: conn.schemaLastSynced || 0,
    }));

    res.json({ connections: masked });
  } catch (error) {
    console.error('Error fetching database connections:', error);
    res.status(500).json({
      connections: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE /api/databases/:connectionId
 * Delete a saved database connection.
 */
export async function deleteDatabaseConnection(req: AuthRequest, res: Response) {
  try {
    const { connectionId } = req.params;

    if (!connectionId) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing connectionId');
    }

    await DatabaseConnectionModel.delete(connectionId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting database connection:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/databases/:connectionId/refresh-schema
 * Re-introspect schema for an existing connection (decrypts credentials, runs introspection, saves result).
 */
export async function refreshDatabaseSchema(req: AuthRequest, res: Response) {
  try {
    const { connectionId } = req.params;
    if (!connectionId) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing connectionId');
    }

    const record = await DatabaseConnectionModel.get(connectionId);
    if (!record) {
      return errorResponse(res, 404, ErrorCodes.NOT_FOUND, 'Connection not found');
    }

    const { decrypt } = await import('../utils/encryption.js');
    const plainConfig: DbConnectionConfig = {
      dbType: record.dbType as DbConnectionConfig['dbType'],
      host: decrypt(record.host),
      port: record.port,
      database: decrypt(record.database),
      username: decrypt(record.username),
      password: decrypt(record.password),
      ...(record.sslEnabled ? {
        ssl: {
          enabled: true,
          rejectUnauthorized: record.sslRejectUnauthorized !== false,
          ...(record.sslCaCert ? { ca: decrypt(record.sslCaCert) } : {}),
          ...(record.sslClientCert ? { cert: decrypt(record.sslClientCert) } : {}),
          ...(record.sslClientKey ? { key: decrypt(record.sslClientKey) } : {}),
        }
      } : {}),
      mssqlEncrypt: record.mssqlEncrypt,
      mssqlTrustServerCert: record.mssqlTrustServerCert,
      mongoAuthSource: record.mongoAuthSource,
      mongoConnectionString: record.mongoConnectionString ? decrypt(record.mongoConnectionString) : undefined,
    };

    const schemaDoc = await introspectSchema(
      plainConfig,
      connectionId,
      record.name,
      record.selectedTables || [],
    );

    await DatabaseConnectionModel.update({ id: connectionId }, { schemaDoc, schemaLastSynced: Date.now() });

    res.json({ success: true, schemaLastSynced: Date.now() });
  } catch (error) {
    console.error('Error refreshing database schema:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/databases/:chatbotId/nl-query
 * Run a natural language query against the chatbot's connected database.
 * For use by the chatbot owner from the Tools > Databases panel.
 */
export async function nlQueryDatabase(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { query } = req.body;

    if (!chatbotId || !query?.trim()) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'Missing chatbotId or query');
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const result = await runTextToSQL(chatbotId, query.trim(), openai, model);

    if (!result) {
      return res.json({
        success: false,
        error: "Couldn't interpret this as a database query, or no schema is available yet. Try refreshing the schema first.",
      });
    }

    res.json({
      success: true,
      answer: result.answer,
      executedQuery: result.executedQuery,
      queryType: result.queryType,
      rowCount: result.rowCount,
      connectionName: result.connectionName,
      duration: result.duration,
    });
  } catch (error) {
    console.error('Error running NL query:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
