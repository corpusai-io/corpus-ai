import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Entity, Service } from "electrodb";

import { env } from "../utils/env";

const client = new DynamoDBClient({});

const table = env("AWS_DYNAMO_INTEGRATIONS_TABLE");

export const slackIntegration = new Entity({
  model: {
    entity: "SlackIntegration",
    service: "integrations",
    version: "1",
  },
  attributes: {
    chatbotId: {
      type: "string",
    },
    workspaceId: {
      type: "string",
    },
    workspaceName: {
      type: "string",
    },
    token: {
      type: "string",
    },
    updatedAt: {
      type: "string",
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      collection: "integrationsByChatbotId",
      pk: {
        field: "pk",
        composite: ["chatbotId"],
      },
      sk: {
        field: "sk",
        composite: [],
      },
    },
    byWorkspaceId: {
      index: "gsi1pk-gsi1sk-index",
      pk: {
        field: "gsi1pk",
        composite: ["workspaceId"],
      },
      sk: {
        field: "gsi1sk",
        composite: ["updatedAt"],
      },
    },
  },
});

/**
 * Zapier trigger requires to register a hook url for each chatbot to call to trigger zapier flow.
 */
export const zapierIntegration = new Entity({
  model: {
    entity: "ZapierIntegration",
    service: "integrations",
    version: "1",
  },
  attributes: {
    chatbotId: {
      type: "string",
    },
    hookUrl: {
      type: "string",
    },
    hookType: {
      type: "string",
    },
    updatedAt: {
      type: "string",
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      collection: "zapierIntegrationsByChatbotId",
      pk: {
        field: "pk",
        composite: ["chatbotId"],
      },
      sk: {
        field: "sk",
        composite: ["hookType"],
      },
    },
  },
});

/**
 * Google drive integration
 */
export const googleDriveIntegration = new Entity({
  model: {
    entity: "GoogleDriveIntegration",
    service: "integrations",
    version: "1",
  },
  attributes: {
    chatbotId: {
      type: "string",
    },
    googleProfileId: {
      type: "string",
    },
    updatedAt: {
      type: "string",
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      collection: "googleDriveByChatbotId",
      pk: {
        field: "pk",
        composite: ["chatbotId"],
      },
      sk: {
        field: "sk",
        composite: ["chatbotId"],
      },
    },
  },
});

/**
 * Google drive encrypted refresh token records
 */
export const googleDriveRefreshToken = new Entity({
  model: {
    entity: "GoogleDriveRefreshToken",
    service: "integrations",
    version: "1",
  },
  attributes: {
    googleProfileId: {
      type: "string",
    },
    googleProfileName: {
      type: "string",
    },
    googleProfileEmail: {
      type: "string",
    },
    refreshToken: {
      type: "string",
    },
    username: {
      type: "string", // denser user account id
    },
    updatedAt: {
      type: "string",
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      collection: "googleDriveRefreshTokenByProfileId",
      pk: {
        field: "pk",
        composite: ["googleProfileId"],
      },
      sk: {
        field: "sk",
        composite: ["googleProfileId"],
      },
    },
    byUsername: {
      index: "gsi1pk-gsi1sk-index",
      pk: {
        field: "gsi1pk",
        composite: ["username"],
      },
      sk: {
        field: "gsi1sk",
        composite: ["updatedAt"],
      },
    },
  },
});

/**
 * Telegram integration for chatbot
 */
export const telegramIntegration = new Entity({
  model: {
    entity: "TelegramIntegration",
    service: "integrations",
    version: "1",
  },
  attributes: {
    chatbotId: {
      type: "string",
    },
    httpToken: {
      type: "string",
    },
    secretKey: {
      type: "string",
    },
    botId: {
      type: "string",
    },
    updatedAt: {
      type: "string",
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      collection: "telegramIntegrationsByChatbotId",
      pk: {
        field: "pk",
        composite: ["chatbotId"],
      },
      sk: {
        field: "sk",
        composite: ["chatbotId"],
      },
    },
    byBotId: {
      index: "gsi1pk-gsi1sk-index",
      pk: {
        field: "gsi1pk",
        composite: ["botId"],
      },
      sk: {
        field: "gsi1sk",
        composite: [],
      },
    },
  },
});

/**
 * WhatsApp integration
 */
export const whatsAppIntegration = new Entity({
  model: {
    entity: "WhatsAppIntegration",
    service: "integrations",
    version: "1",
  },
  attributes: {
    chatbotId: {
      type: "string",
    },
    businessAccountId: {
      type: "string",
    },
    phoneNumberId: {
      type: "string",
    },
    accessToken: {
      type: "string",
      required: true
    },
    verificationToken: {
      type: "string",
    },
    updatedAt: {
      type: "string",
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      collection: "integrationsByChatbotId",
      pk: {
        field: "pk",
        composite: ["chatbotId"],
      },
      sk: {
        field: "sk",
        composite: ["phoneNumberId"],
      },
    },
    byPhoneNumberId: {
      index: "gsi1pk-gsi1sk-index",
      pk: {
        field: "gsi1pk",
        composite: ["phoneNumberId"],
      },
      sk: {
        field: "gsi1sk",
        composite: ["updatedAt"],
      },
    },
    byVerificationToken: {
      index: "gsi2pk-gsi2sk-index",
      pk: {
        field: "gsi2pk",
        composite: ["verificationToken"],
      },
      sk: {
        field: "gsi2sk",
        composite: ["updatedAt"],
      },
    },
  },
});

export const integrationsService = new Service(
  {
    slackIntegration,
    zapierIntegration,
    googleDriveIntegration,
    googleDriveRefreshToken,
    whatsAppIntegration,
    telegramIntegration,
  },
  { client, table },
);

export interface HandleSlackEntity {
  chatbotId: string;
  token: string;
}

export interface HandleZapierEntity {
  chatbotId: string;
}

export interface HandleGoogleDriveEntity {
  username: string;
  refreshToken: string;
}
export interface HandleWhatsAppEntity {
  chatbotId: string;
  phoneNumberId: string;
  accessToken: string;
}
export interface HandleTelegramEntity {
  chatbotId: string;
  httpToken: string;
  secretKey: string;
  botId: string;
}
