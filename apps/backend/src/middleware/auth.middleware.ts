import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserModel, ApiKeyModel } from '@corpusai/aws-common';

const COGNITO_REGION = process.env.AWS_COGNITO_REGION || 'eu-north-1';
const COGNITO_DOMAIN = (process.env.AWS_COGNITO_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
console.log(`[auth] Cognito client init — region: ${COGNITO_REGION} | domain: ${COGNITO_DOMAIN} | client_id prefix: ${(process.env.AWS_COGNITO_CLIENT_ID || 'NOT_SET').substring(0, 8)}...`);

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Decode a JWT payload without signature verification.
// Used only to inspect the `scope` claim so we can choose the right
// Cognito validation path — not for security decisions.
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

// Returns true when the token came from the Cognito Hosted UI OAuth2 code
// flow (Google SSO etc).  These tokens carry "openid" in their scope and
// must be validated via /oauth2/userInfo — Cognito's GetUserCommand rejects
// them.  Direct-auth tokens (InitiateAuth / SRP) use the admin.signin scope
// and work with GetUserCommand.
export function isHostedUiToken(token: string): boolean {
  const claims = decodeJwtPayload(token);
  return typeof claims?.scope === 'string' && claims.scope.includes('openid');
}

// Validates a token via the Cognito Hosted UI /oauth2/userInfo endpoint.
// SSO (Google) tokens from the Hosted UI code-exchange flow are OAuth2
// access tokens — Cognito's GetUserCommand rejects them; the userInfo
// endpoint is the correct validation path for these tokens.
export async function validateViaUserInfo(accessToken: string): Promise<{ email: string; sub: string } | null> {
  if (!COGNITO_DOMAIN) return null;
  try {
    const resp = await fetch(`https://${COGNITO_DOMAIN}/oauth2/userInfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) {
      console.error(`[auth] userInfo endpoint returned ${resp.status}`);
      return null;
    }
    const info = await resp.json() as Record<string, string>;
    return { email: info.email || info.sub, sub: info.sub };
  } catch (err: any) {
    console.error('[auth] userInfo fetch error:', err.message);
    return null;
  }
}

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
    const tokenPrefix = accessToken.substring(0, 20);

    try {
      let email: string;
      let username: string;

      if (isHostedUiToken(accessToken)) {
        // Hosted UI / SSO token — use userInfo endpoint directly
        const userInfo = await validateViaUserInfo(accessToken);
        if (!userInfo) {
          console.error(`[auth] ❌ userInfo rejected SSO token | prefix: ${tokenPrefix}`);
          return res.status(401).json({ error: 'Token expired or invalid', message: 'Your session has expired. Please login again.' });
        }
        email = userInfo.email;
        username = userInfo.sub || email;
      } else {
        // Direct-auth token (email/password via InitiateAuth) — use GetUserCommand
        const cognitoUser = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));
        const emailAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'email');
        email = emailAttr?.Value || cognitoUser.Username || '';
        username = cognitoUser.Username!;
      }

      const users = await UserModel.query('username').eq(email).exec();
      const tier = users && users.length > 0 ? users[0].tier : 0;

      console.log(`[auth] ✅ ${isHostedUiToken(accessToken) ? 'SSO' : 'direct'} — user: ${email} | tier: ${tier}`);
      req.user = { username, email, tier };
      next();
    } catch (error: any) {
      const isNotAuthorized =
        error.name === 'NotAuthorizedException' ||
        error.__type === 'NotAuthorizedException' ||
        error.message === 'NotAuthorizedException';
      if (isNotAuthorized) {
        console.error(`[auth] ❌ Token rejected | prefix: ${tokenPrefix}`);
        return res.status(401).json({ error: 'Token expired or invalid', message: 'Your session has expired. Please login again.' });
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
      return next();
    }

    const accessToken = authHeader.substring(7);

    try {
      let email: string;
      let username: string;

      if (isHostedUiToken(accessToken)) {
        const userInfo = await validateViaUserInfo(accessToken);
        if (!userInfo) {
          return next(); // invalid SSO token, proceed without user context
        }
        email = userInfo.email;
        username = userInfo.sub || email;
      } else {
        const cognitoUser = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));
        const emailAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'email');
        email = emailAttr?.Value || cognitoUser.Username || '';
        username = cognitoUser.Username!;
      }

      const users = await UserModel.query('username').eq(email).exec();
      const tier = users && users.length > 0 ? users[0].tier : 0;
      req.user = { username, email, tier };
    } catch (error) {
      console.warn('[auth] Optional auth: invalid token, continuing without user context');
    }

    next();
  } catch (error) {
    console.error('Error in optional auth:', error);
    next();
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
    let email: string;
    let username: string;

    if (isHostedUiToken(token)) {
      const userInfo = await validateViaUserInfo(token);
      if (!userInfo) {
        return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
      }
      email = userInfo.email;
      username = userInfo.sub || email;
    } else {
      const cognitoUser = await cognitoClient.send(new GetUserCommand({ AccessToken: token }));
      const emailAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'email');
      email = emailAttr?.Value || cognitoUser.Username!;
      username = cognitoUser.Username!;
    }

    const users = await UserModel.query('username').eq(email).exec();
    const tier = users && users.length > 0 ? users[0].tier : 0;
    req.user = { username, email, tier };
    return next();
  } catch (error: any) {
    const code = error.name || error.__type || error.message || '';
    if (
      code === 'NotAuthorizedException' ||
      code === 'InvalidParameterException' ||
      code === 'UserNotFoundException'
    ) {
      return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
    }

    console.error('[AUTH] Chat authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
