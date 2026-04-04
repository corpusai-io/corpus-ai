import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { env } from "../utils/env";

export const AWSMarketplaceToken = "x-amzn-marketplace-token";
export const AWSMarketplaceCookieName = "aws-marketplace-customer-token";

export class UserRecord extends Item {
  username!: string;
  chat_usage!: number;
  customer!: string;
  email!: string;
  name!: string;
  picture!: string;
  since!: number; // Payment account creation date
  resetAt!: number; // User metering reset date
  expireAt!: number; // Expire date. Before the date we can safely reset user metering
  tier!: number;
  customer_type!: CustomerType;
}

export const UserSchema = new dynamoose.Schema({
  username: {
    type: String,
    hashKey: true,
  },
  customer: {
    type: String,
    rangeKey: true,
    index: {
      name: "customer-index",
    },
  },
  chat_usage: Number,
  email: String,
  name: String,
  picture: String,
  resetAt: Number,
  since: Number,
  tier: Number,
  expireAt: Number,
  customer_type: String,
});

export const UserModel = dynamoose.model<UserRecord>(
  env("AWS_DYNAMO_USER_TABLE"),
  UserSchema,
);

export type CustomerType = "aws" | "stripe"; // default empty string points to stripe.
