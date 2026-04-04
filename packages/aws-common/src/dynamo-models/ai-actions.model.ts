import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { env } from "../utils/env";

export class AiActionsRecord extends Item {
  chatbotId!: string;
  buttonActions!: string; // JSON-serialised ButtonAction[]
  formActions!: string;   // JSON-serialised FormAction[]
  builtins!: string;      // JSON-serialised BuiltinIntegration[]
  updatedAt!: number;
}

export const AiActionsSchema = new dynamoose.Schema({
  chatbotId: {
    type: String,
    hashKey: true,
  },
  buttonActions: {
    type: String,
    default: "[]",
  },
  formActions: {
    type: String,
    default: "[]",
  },
  builtins: {
    type: String,
    default: "[]",
  },
  updatedAt: {
    type: Number,
    default: () => Date.now(),
  },
});

export const AiActionsModel = dynamoose.model<AiActionsRecord>(
  env("AWS_DYNAMO_AI_ACTIONS_TABLE"),
  AiActionsSchema,
);
