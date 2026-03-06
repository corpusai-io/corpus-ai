import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { uniqueTimestamp } from "../utils";
import { env } from "../utils/env";

export class LeadGenerationRecord extends Item {
  chatbotId!: string;
  email!: string;
  uniqueTimestamp!: string;
}

export const LeadGenerationSchema = new dynamoose.Schema({
  chatbotId: {
    type: String,
    hashKey: true,
  },
  email: String,
  uniqueTimestamp: {
    type: String,
    default: uniqueTimestamp,
    rangeKey: true,
  },
});

export const LeadGenerationModel = dynamoose.model<LeadGenerationRecord>(
  env("AWS_DYNAMO_LEAD_GENERATION_TABLE"),
  LeadGenerationSchema,
);
