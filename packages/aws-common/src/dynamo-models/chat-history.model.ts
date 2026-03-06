import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { uniqueTimestamp } from "../utils";
import { env } from "../utils/env";

export class ChatHistoryRecord extends Item {
  chatbotId!: string;
  messageId!: string;
  username!: string;
  sessionId!: string;
  role!: "user" | "bot";
  content!: string;
  citations!: string;
  feedback!: number;
  createdAt!: string;
}

export const ChatHistorySchema = new dynamoose.Schema({
  chatbotId: {
    type: String,
    hashKey: true,
  },
  messageId: {
    type: String,
    default: uniqueTimestamp,
    rangeKey: true,
  },
  username: {
    type: String,
    index: {
      name: "username-chatbotId-index",
      rangeKey: "chatbotId",
    },
  },
  sessionId: String,
  role: String,
  content: String,
  citations: String,
  feedback: Number,
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

export const ChatHistoryModel = dynamoose.model<ChatHistoryRecord>(
  env("AWS_DYNAMO_CHAT_HISTORY_TABLE", "corpus-chat-history-dev"),
  ChatHistorySchema,
);
