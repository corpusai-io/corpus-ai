import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";
import { v4 } from "uuid";

import { env } from "../utils/env";

// TypeScript type for uuid v4
type UUID = string;

class CustomizeRecord extends Item {
  id!: string;
  chatbotId!: string;
  username!: string;
  type!: string;
  value!: string;
  language!: string;
}

export const CustomizationSchema = new dynamoose.Schema({
  id: {
    type: String,
    rangeKey: true,
    default: v4,
  },
  chatbotId: {
    type: String,
    hashKey: true,
  },
  type: String,
  value: String,
  language: String,
  username: String,
});

export const CustomizationModel = dynamoose.model<CustomizeRecord>(
  env("AWS_DYNAMO_CUSTOMIZATION_TABLE"),
  CustomizationSchema,
);
