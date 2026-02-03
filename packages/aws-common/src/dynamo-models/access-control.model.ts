import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { env } from "../utils/env";

// Send email
// Create user entry with email filled, but empty username etc.

// When user sign up, sync user info to access control table as well

// List users that has access, can add or remove user.

export class AccessControlRecord extends Item {
  chatbotId: string;
  username: string;
  name: string;
  email: string;
  picture: string;
  grantedBy: string;
  grantedTime: string;
}

export const AccessControlSchema = new dynamoose.Schema({
  chatbotId: {
    type: String,
    hashKey: true,
  },
  email: {
    type: String,
    rangeKey: true,
    index: {
      name: "email-index",
    },
  },
  username: String,
  name: String,
  picture: String,
  grantedBy: String,
  grantedTime: String,
  grantedType: String,
});

export const AccessControlModel = dynamoose.model<AccessControlRecord>(
  env("AWS_DYNAMO_ACCESS_CONTROL_TABLE"),
  AccessControlSchema,
);
