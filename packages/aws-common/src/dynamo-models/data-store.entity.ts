import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, Service } from "electrodb";

import { env } from "../utils/env";

// Configure base client to use DynamoDB Local if DYNAMODB_ENDPOINT is set
const baseClient = new DynamoDBClient(
  process.env.DYNAMODB_ENDPOINT
    ? {
        endpoint: process.env.DYNAMODB_ENDPOINT,
        region: process.env.AWS_REGION || "eu-north-1",
      }
    : {}
);

// Wrap with DocumentClient to handle undefined values
const client = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const table = env("AWS_DYNAMO_MAIN_TABLE");

export const dataStore = new Entity(
  {
    model: {
      entity: "DataStore",
      service: "dataStore",
      version: "1",
    },
    attributes: {
      username: {
        type: "string",
      },
      chatbotId: {
        type: "string",
      },
      dataSource: {
        type: "string",
      },
      dataType: {
        type: "string",
      },
      dataSize: {
        type: "number",
      },
      dataCreatedAt: {
        type: "string",
        readOnly: true,
        required: true,
        default: () => new Date().toISOString(),
      },
      dataUpdatedAt: {
        type: "number",
        watch: "*",
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
      skipped: {
        type: "boolean",
        default: () => false,
      },
      pageCount: {
        type: "number",
      },
      crawledPages: {
        type: "number",
      },
      s3Key: {
        type: "string",
      },
      cloudDriveId: {
        type: "string",
      },
      status: {
        type: "string",
        default: "active",
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "PK",  // Changed to uppercase to match DynamoDB table
          composite: ["username", "chatbotId"],
        },
        sk: {
          field: "SK",  // Changed to uppercase to match DynamoDB table
          composite: ["dataSource"],
        },
      },
    },
  },
  { client, table },
);

export const dataStoreService = new Service(
  {
    dataStore,
  },
  { client, table },
);

/*
 Scan table and fetch all the data store records
 */
export async function getDataStoreRecords(username: string, chatbotId: string) {
  let records: {
    username: string;
    chatbotId: string;
    dataSource: string;
    dataType?: string | undefined;
    dataSize?: number | undefined;
    pageCount?: number | undefined;
    crawledPages?: number | undefined;
    s3Key?: string | undefined;
    dataCreatedAt: string;
    dataUpdatedAt: number;
    skipped?: boolean | undefined;
    status?: string | undefined;
  }[] = [];

  let cursor = undefined;
  while (cursor !== null) {
    const output: {
      data: {
        username: string;
        chatbotId: string;
        dataSource: string;
        dataType?: string | undefined;
        dataSize?: number | undefined;
        pageCount?: number | undefined;
        crawledPages?: number | undefined;
        dataCreatedAt: string;
        dataUpdatedAt: number;
        skipped?: boolean | undefined;
        status?: string | undefined;
      }[];
      cursor: string | null;
    } = await dataStore.query
      .primary({
        username,
        chatbotId,
      })
      .go({
        count: 100,
        cursor: cursor,
      });
    cursor = output.cursor;
    records = [...records, ...output.data];
  }

  return records;
}
