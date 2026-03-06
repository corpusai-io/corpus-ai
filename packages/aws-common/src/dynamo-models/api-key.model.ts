import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { env } from "../utils/env";

export class ApiKeyRecord extends Item {
  chatbotId!: string;
  keyId!: string;
  label!: string;
  keyPrefix!: string;
  hashedKey!: string;
  salt!: string;
  iterations!: number;
  createdAt!: number;
  lastUsed!: number;
  createdBy!: string;
}

export const ApiKeySchema = new dynamoose.Schema({
  chatbotId: {
    type: String,
    hashKey: true,
  },
  keyId: {
    type: String,
    rangeKey: true,
  },
  label: {
    type: String,
    default: "",
  },
  keyPrefix: String,
  hashedKey: String,
  salt: String,
  iterations: {
    type: Number,
    default: 10000,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
  lastUsed: {
    type: Number,
    default: 0,
  },
  createdBy: String,
});

export const ApiKeyModel = dynamoose.model<ApiKeyRecord>(
  env("AWS_DYNAMO_API_KEYS_TABLE"),
  ApiKeySchema,
);
