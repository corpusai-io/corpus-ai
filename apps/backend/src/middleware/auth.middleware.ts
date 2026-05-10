import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserModel, ApiKeyModel } from '@corpusai/aws-common';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_COGNITO_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface AuthRequest extends Request {
  user?: {
    username: string;
    email: string;
    tier: number;
  };
}

/**
 * Middleware to authenticate AWS Cognito tokens
 */
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization header provided'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Invalid authorization format',
        message: 'Authorization header must start with "Bearer "'
      });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token with AWS Cognito
      const getUserCommand = new GetUserCommand({
        AccessToken: accessToken,
      });

      const cognitoUser = await cognitoClient.send(getUserCommand);

      // Extract email from user attributes
      const emailAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'email');
      const email = emailAttr?.Value || cognitoUser.Username || '';

      // Get user tier from DynamoDB
      const users = await UserModel.query('username').eq(email).exec();
      const tier = users && users.length > 0 ? users[0].tier : 0;

      // Attach user info to request
      req.user = {
        username: cognitoUser.Username!,
        email,
        tier,
      };

      next();
    } catch (error: any) {
      const isNotAuthorized =
        error.name === 'NotAuthorizedException' ||
        error.__type === 'NotAuthorizedException' ||
        error.message === 'NotAuthorizedException';
      if (isNotAuthorized) {
        return res.status(401).json({
          error: 'Token expired or invalid',
          message: 'Your session has expired. Please login again.'
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Error authenticating token:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Optional middleware - allows requests with or without auth
 */
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user info
      return next();
    }

    const accessToken = authHeader.substring(7);

    try {
      // Verify token with AWS Cognito
      const getUserCommand = new GetUserCommand({
        AccessToken: accessToken,
      });

      const cognitoUser = await cognitoClient.send(getUserCommand);

      // Extract email from user attributes
      const emailAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'email');
      const email = emailAttr?.Value || cognitoUser.Username || '';

      // Get user tier from DynamoDB
      const users = await UserModel.query('username').eq(email).exec();
      const tier = users && users.length > 0 ? users[0].tier : 0;

      req.user = {
        username: cognitoUser.Username!,
        email,
        tier,
      };
    } catch (error) {
      // Invalid token, but don't fail the request
      console.warn('Optional auth: Invalid token provided');
    }

    next();
  } catch (error) {
    console.error('Error in optional auth:', error);
    next(); // Continue without auth on error
  }
}

/**
 * Middleware to check if user owns the resource
 */
export function requireOwnership(usernameField: string = 'username') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const resourceUsername = req.body[usernameField] || req.query[usernameField];

    if (!resourceUsername) {
      return res.status(400).json({
        error: `Missing ${usernameField} in request`
      });
    }

    if (req.user.username !== resourceUsername && req.user.email !== resourceUsername) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
}

/**
 * Middleware to check user tier/plan
 */
export function requireTier(minTier: number) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (req.user.tier < minTier) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: `This feature requires tier ${minTier} or higher. Your current tier: ${req.user.tier}`
      });
    }

    next();
  };
}

/**
 * Chat endpoint authentication middleware.
 *
 * Supports two credential types in the Authorization header:
 *   - API key  (prefix: corpus_)  → validated against ApiKeyModel (all keys for the chatbot)
 *   - Cognito access token        → validated via GetUser call
 *
 * If NO Authorization header is present the request is allowed through without
 * req.user set — this covers public widget embeds on customer sites.
 *
 * If an Authorization header IS present it MUST be valid; any invalid/garbage
 * value is rejected with 401.
 */
export async function authenticateChat(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // No header → public/widget access, allow without user context
  if (!authHeader) {
    return next();
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Invalid authorization format',
      message: 'Authorization header must start with "Bearer "',
    });
  }

  const token = authHeader.substring(7);

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is empty' });
  }

  // ── API key path (corpus_ prefix) ────────────────────────────────────────
  if (token.startsWith('corpus_')) {
    const chatbotId = req.body?.chatbotId;

    if (!chatbotId) {
      return res.status(400).json({ error: 'chatbotId is required when using an API key' });
    }

    try {
      const keys = await ApiKeyModel.query('chatbotId').eq(chatbotId).exec();

      if (!keys || keys.length === 0) {
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
        });
      }

      let matchedKey: any = null;

      for (const keyRecord of keys) {
        try {
          const hashed = crypto
            .pbkdf2Sync(token, keyRecord.salt, keyRecord.iterations || 10000, 64, 'sha512')
            .toString('hex');

          // Constant-time comparison prevents timing attacks
          const hashedBuf   = Buffer.from(hashed, 'hex');
          const storedBuf   = Buffer.from(keyRecord.hashedKey, 'hex');

          if (
            hashedBuf.length === storedBuf.length &&
            crypto.timingSafeEqual(hashedBuf, storedBuf)
          ) {
            matchedKey = keyRecord;
            break;
          }
        } catch {
          // salt/iterations mismatch on this record — skip
          continue;
        }
      }

      if (!matchedKey) {
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
        });
      }

      // Fire-and-forget: update lastUsed timestamp
      matchedKey.lastUsed = Date.now();
      matchedKey.save().catch((err: any) =>
        console.warn('[AUTH] Failed to update API key lastUsed:', err)
      );

      // Attach minimal context so downstream handlers know it's API-key auth
      req.user = {
        username: `apikey:${matchedKey.keyId}`,
        email: `apikey:${matchedKey.keyId}`,
        tier: 0,
      };

      return next();
    } catch (err) {
      console.error('[AUTH] API key validation error:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // ── Cognito JWT path ──────────────────────────────────────────────────────
  try {
    const getUserCommand = new GetUserCommand({ AccessToken: token });
    const cognitoUser = await cognitoClient.send(getUserCommand);

    const emailAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'email');
    const email = emailAttr?.Value || cognitoUser.Username!;

    const users = await UserModel.query('username').eq(email).exec();
    const tier = users && users.length > 0 ? users[0].tier : 0;

    req.user = {
      username: cognitoUser.Username!,
      email,
      tier,
    };

    return next();
  } catch (error: any) {
    const code = error.name || error.__type || error.message || '';
    if (
      code === 'NotAuthorizedException' ||
      code === 'InvalidParameterException' ||
      code === 'UserNotFoundException'
    ) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: 'Provide a valid Cognito access token or a corpus_ API key',
        code: 'INVALID_TOKEN',
      });
    }

    console.error('[AUTH] Chat authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
