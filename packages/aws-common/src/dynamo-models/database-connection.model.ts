import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { env } from "../utils/env";

export class DatabaseConnectionRecord extends Item {
  id!: string;
  chatbotId!: string;
  userId!: string;
  dbType!: string;
  name!: string;
  host!: string;
  port!: number;
  database!: string;
  username!: string;
  password!: string;
  selectedTables!: string[];
  status!: string;
  // SSL (MySQL, PostgreSQL)
  sslEnabled?: boolean;
  sslCaCert?: string;
  sslClientCert?: string;
  sslClientKey?: string;
  sslRejectUnauthorized?: boolean;
  // MSSQL
  mssqlEncrypt?: boolean;
  mssqlTrustServerCert?: boolean;
  // MongoDB
  mongoAuthSource?: string;
  mongoConnectionString?: string;
  // Schema cache
  schemaDoc?: string;         // JSON string of introspected schema
  schemaLastSynced?: number;  // Unix timestamp ms
  createdAt!: number;
  updatedAt!: number;
}

export const DatabaseConnectionSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    chatbotId: {
      type: String,
      index: {
        name: "chatbotId-index",
      },
    },
    userId: String,
    dbType: String,
    name: String,
    host: String,
    port: Number,
    database: String,
    username: String,
    password: String,
    selectedTables: {
      type: Array,
      schema: [String],
    },
    status: {
      type: String,
      default: "connected",
    },
    // SSL (MySQL, PostgreSQL)
    sslEnabled: {
      type: Boolean,
      default: false,
    },
    sslCaCert: {
      type: String,
      default: "",
    },
    sslClientCert: {
      type: String,
      default: "",
    },
    sslClientKey: {
      type: String,
      default: "",
    },
    sslRejectUnauthorized: {
      type: Boolean,
      default: true,
    },
    // MSSQL
    mssqlEncrypt: {
      type: Boolean,
      default: false,
    },
    mssqlTrustServerCert: {
      type: Boolean,
      default: true,
    },
    // MongoDB
    mongoAuthSource: {
      type: String,
      default: "",
    },
    mongoConnectionString: {
      type: String,
      default: "",
    },
    // Schema cache
    schemaDoc: {
      type: String,
      default: "",
    },
    schemaLastSynced: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const DatabaseConnectionModel = dynamoose.model<DatabaseConnectionRecord>(
  env("AWS_DYNAMO_DATABASE_CONNECTIONS_TABLE"),
  DatabaseConnectionSchema,
);
