/**
 * Shared types for all lambdaChat handlers
 */

export interface ErrorPayload {
  type: 'error';
  code: string;
  message: string;
}

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/** CORS headers for HTTP responses */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

export const MAX_QUERY_LENGTH = 5000;
export const MAX_SESSION_MESSAGES = 10;
export const SESSION_TTL_SECONDS = 86400; // 24 hours
