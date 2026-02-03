import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { env } from "../utils/env";

export class ChatbotRecord extends Item {
  chatbotId: string;
  title?: string;
  desc?: string;
  createdAt: number;
  updatedAt: number;
  indexName: string;
  origin: string;
  username: string;
  accessMode: string;
  subdomain: string;
  language: string;
  apiKeyHashSalt: string;
  apiKeyHashIterations: number;
  hashedApiKey: string;
  webCountUsage: number;
  fileSizeUsage: number;
  status: string; // ACTIVE, BUILDING, ERROR
  step?: number; // Current build step
  errorStep?: number; // Error step if any
  errorMessage?: string; // Error message if any
  lastRebuildDateTime?: string;
}

export const ChatbotSchema = new dynamoose.Schema(
  {
    chatbotId: {
      type: String,
      hashKey: true,
    },
    title: String,
    desc: String,
    indexName: String,
    origin: String,
    username: {
      type: String,
      index: {
        name: "username-index",
      },
    },
    accessMode: String,
    subdomain: String,
    language: {
      type: String,
      default: "en",
    },
    apiKeyHashSalt: String,
    apiKeyHashIterations: Number,
    hashedApiKey: String,
    webCountUsage: Number,
    fileSizeUsage: Number,
    status: {
      type: String,
      default: "BUILDING",
    },
    step: Number,
    errorStep: Number,
    errorMessage: String,
    lastRebuildDateTime: String,
  },
  {
    timestamps: true,
  },
);

export const ChatbotModel = dynamoose.model<ChatbotRecord>(
  env("AWS_DYNAMO_CHATBOT_TABLE"),
  ChatbotSchema,
);

export async function getChatbotById(chatbotId: string) {
  const chatbots = await ChatbotModel.query("chatbotId").eq(chatbotId).exec();

  if (chatbots.count === 0) {
    return null;
  }
  return chatbots[0];
}
