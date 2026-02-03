import { Request, Response, NextFunction } from 'express';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserModel } from '@corpusai/aws-common';

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
      const email = emailAttr?.Value || cognitoUser.Username;

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
      if (error.name === 'NotAuthorizedException') {
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
      const email = emailAttr?.Value || cognitoUser.Username;

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
