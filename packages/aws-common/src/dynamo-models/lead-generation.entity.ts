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

const table = env("AWS_DYNAMO_LEAD_GENERATION_TABLE");

export const leadData = new Entity(
  {
    model: {
      entity: "LeadData",
      service: "leads",
      version: "1",
    },
    attributes: {
      dataId: {
        type: "string",
      },
      fieldsId: {
        type: "string",
      },
      chatbotId: {
        type: "string",
      },
      data: {
        type: "any",
      },
      dataCreatedAt: {
        type: "string",
        default: () => new Date().toISOString(),
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "PK",  // Changed to uppercase to match DynamoDB table
          composite: ["chatbotId"],
        },
        sk: {
          field: "SK",  // Changed to uppercase to match DynamoDB table
          composite: ["dataId"],
        },
      },
      byChatbotId: {
        index: "gsi1pk-gsi1sk-index",
        pk: {
          field: "gsi1pk",
          composite: ["chatbotId"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["dataCreatedAt"],
        },
      },
    },
  },
  { client, table },
);

export const leadFields = new Entity(
  {
    model: {
      entity: "LeadGeneration",
      service: "leads",
      version: "1",
    },
    attributes: {
      chatbotId: {
        type: "string",
      },
      fieldsId: {
        type: "string",
      },
      title: {
        type: "string",
      },
      fields: {
        type: "list",
        items: {
          type: "map",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            required: { type: "boolean" },
            key: { type: "string" },
          },
        },
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "PK",  // Changed to uppercase to match DynamoDB table
          composite: ["chatbotId"],
        },
        sk: {
          field: "SK",  // Changed to uppercase to match DynamoDB table
          composite: ["fieldsId"],
        },
      },
    },
  },
  { client, table },
);

export const leadsService = new Service({
  leadData,
  leadFields,
});
