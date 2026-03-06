import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";
import { env } from "../utils/env";

export class BuiltinIntegrationRecord extends Item {
  chatbotId!: string;
  integrationKey!: string;
  enabled!: boolean;
  connected!: boolean;
  encryptedCredentials!: string; // AES-256-GCM encrypted JSON of credential key-value pairs
  operations!: string;           // JSON array of enabled operation keys
  triggerDescription!: string;
  metadata!: string;             // JSON: { accountName: string, [key: string]: string }
  updatedAt!: number;
}

export const BuiltinIntegrationSchema = new dynamoose.Schema({
  chatbotId: { type: String, hashKey: true },
  integrationKey: { type: String, rangeKey: true },
  enabled: { type: Boolean, default: true },
  connected: { type: Boolean, default: false },
  encryptedCredentials: { type: String, default: "" },
  operations: { type: String, default: "[]" },
  triggerDescription: { type: String, default: "" },
  metadata: { type: String, default: "{}" },
  updatedAt: { type: Number, default: () => Date.now() },
});

export const BuiltinIntegrationModel = dynamoose.model<BuiltinIntegrationRecord>(
  env("AWS_DYNAMO_BUILTIN_INTEGRATIONS_TABLE"),
  BuiltinIntegrationSchema,
);
