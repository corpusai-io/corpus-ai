import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { getChatbotById } from '@corpusai/aws-common';
import * as crypto from 'crypto';

/**
 * Authentication helpers for WebSocket $connect handler
 */

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_COGNITO_REGION || process.env.AWS_REGION || 'eu-north-1',
});

/**
 * Verify a Cognito access token and return the user's identity.
 */
export async function verifyCognitoToken(
  accessToken: string,
): Promise<{ email: string; username: string } | null> {
  try {
    const result = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));
    const emailAttr = result.UserAttributes?.find(a => a.Name === 'email');
    return {
      email: emailAttr?.Value || result.Username || '',
      username: result.Username || '',
    };
  } catch {
    return null;
  }
}

/**
 * Verify an API key against a chatbot's stored PBKDF2 hash.
 */
export async function verifyApiKey(apiKey: string, chatbotId: string): Promise<boolean> {
  try {
    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot || !chatbot.hashedApiKey || !chatbot.apiKeyHashSalt) {
      return false;
    }
    const iterations = chatbot.apiKeyHashIterations || 10000;
    const hash = crypto.pbkdf2Sync(apiKey, chatbot.apiKeyHashSalt, iterations, 64, 'sha512').toString('hex');
    return hash === chatbot.hashedApiKey;
  } catch {
    return false;
  }
}
