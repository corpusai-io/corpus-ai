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

// Use the main single-table (same as dataStore entity) to avoid key schema
// conflicts with the Dynamoose LeadGenerationModel on corpus-lead-generation-dev.
const table = env("AWS_DYNAMO_MAIN_TABLE");

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
      sessionId: {
        type: "string",
      },
      intent: {
        type: "string", // 'hot' | 'warm' | 'cold'
      },
      status: {
        type: "string", // 'new' | 'contacted' | 'converted' | 'archived'
        default: "new",
      },
      triggerType: {
        type: "string", // 'gated' | 'after_messages' | 'high_intent' | 'cant_answer' | 'exit_intent'
      },
      sourcePage: {
        type: "string",
      },
      notes: {
        type: "string",
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
      triggerConfig: {
        type: "map",
        properties: {
          triggerType: { type: "string" }, // 'gated' | 'after_messages' | 'high_intent' | 'cant_answer' | 'exit_intent'
          messageThreshold: { type: "number" },
          formStyle: { type: "string" }, // 'popup' | 'inline'
          enabled: { type: "boolean" },
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
