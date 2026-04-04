export interface TableSchema {
  name: string;
  columns: Array<{ name: string; type: string; nullable: boolean; primaryKey?: boolean }>;
  rowCount?: number;
}

export interface DatabaseSchema {
  connectionId: string;
  connectionName: string;
  dbType: 'postgresql' | 'mysql' | 'mssql' | 'mongodb';
  tables: TableSchema[];
}

export interface DecryptedDbConfig {
  id: string;
  dbType: 'postgresql' | 'mysql' | 'mssql' | 'mongodb';
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  selectedTables: string[];
  schemaDoc: string;
  sslEnabled?: boolean;
  sslCaCert?: string;
  sslClientCert?: string;
  sslClientKey?: string;
  sslRejectUnauthorized?: boolean;
  mssqlEncrypt?: boolean;
  mssqlTrustServerCert?: boolean;
  mongoAuthSource?: string;
  mongoConnectionString?: string;
}

export interface TextToSqlResult {
  answer: string;
  executedQuery: string;
  queryType: 'sql' | 'mql';
  rowCount: number;
  connectionName: string;
  duration: number;
}
