import { Request, Response } from 'express';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AdminConfirmSignUpCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserModel } from '@corpusai/aws-common';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_COGNITO_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;

interface AuthRequest extends Request {
  user?: {
    username: string;
    email: string;
    tier: number;
  };
}

/**
 * Register a new user with AWS Cognito
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response) {
  console.log('\n🔍 [AUTH] Register endpoint called');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { email, password, name } = req.body;
    console.log(`Registering user: ${email}`);

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long'
      });
    }

    // Register user in AWS Cognito
    console.log('Sending SignUpCommand to Cognito...');
    const signUpCommand = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: name || email.split('@')[0],
        },
      ],
    });

    const cognitoResponse = await cognitoClient.send(signUpCommand);
    console.log('✅ Cognito signup successful. UserSub:', cognitoResponse.UserSub);

    // Create user record in DynamoDB (without password)
    console.log('Creating user record in DynamoDB...');
    const user = new UserModel({
      username: email,
      customer: `cus_free_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      chat_usage: 0,
      tier: 0,
      customer_type: 'stripe',
      resetAt: Date.now(),
      since: Date.now(),
      expireAt: Date.now() + (10 * 24 * 60 * 60 * 1000), // 10 day trial
    });

    await user.save();
    console.log('✅ User saved to DynamoDB');

    console.log('Sending success response...');
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        username: email,
        email,
        name: user.name,
        tier: user.tier,
        since: user.since,
        expireAt: user.expireAt,
      },
      cognitoUserSub: cognitoResponse.UserSub,
      // Note: Cognito doesn't return tokens on signup, user needs to confirm email first
    });
  } catch (error: any) {
    console.error('\n❌ [AUTH] Error registering user');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));

    // Handle Cognito-specific errors
    if (error.name === 'UsernameExistsException') {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    if (error.name === 'InvalidPasswordException') {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to register user',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Login user with AWS Cognito
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password'
      });
    }

    // Authenticate with AWS Cognito
    const authCommand = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const authResponse = await cognitoClient.send(authCommand);

    if (!authResponse.AuthenticationResult) {
      return res.status(401).json({
        error: 'Authentication failed'
      });
    }

    const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;

    // Get user data from DynamoDB
    const users = await UserModel.query('username').eq(email).exec();

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'User not found in database'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        username: user.username,
        email: user.email,
        name: user.name,
        tier: user.tier,
        chat_usage: user.chat_usage,
        since: user.since,
        expireAt: user.expireAt,
      },
      token: IdToken, // Cognito ID token (JWT)
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    });
  } catch (error: any) {
    console.error('Error logging in:', error);

    // Handle Cognito-specific errors
    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    if (error.name === 'UserNotConfirmedException') {
      return res.status(401).json({
        error: 'Email not verified. Please check your email and confirm your account.'
      });
    }

    res.status(500).json({
      error: 'Failed to login',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated'
      });
    }

    // Get fresh user data from DynamoDB
    const users = await UserModel.query('username').eq(req.user.email).exec();

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        name: user.name,
        tier: user.tier,
        chat_usage: user.chat_usage,
        since: user.since,
        expireAt: user.expireAt,
        resetAt: user.resetAt,
      },
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      error: 'Failed to get user info',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Logout user from AWS Cognito
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);

      // Global sign out from Cognito
      const signOutCommand = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await cognitoClient.send(signOutCommand);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    // Even if Cognito logout fails, we return success
    // Client should remove tokens
    res.json({
      success: true,
      message: 'Logout successful. Please remove tokens from client.'
    });
  }
}

/**
 * Verify Cognito JWT token
 * GET /api/auth/verify
 */
export async function verifyToken(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        valid: false,
        error: 'No token provided'
      });
    }

    const accessToken = authHeader.substring(7);

    // Verify token by getting user from Cognito
    const getUserCommand = new GetUserCommand({
      AccessToken: accessToken,
    });

    const cognitoUser = await cognitoClient.send(getUserCommand);

    // Extract email from user attributes
    const emailAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'email');
    const email = emailAttr?.Value || cognitoUser.Username;

    // Get tier from DynamoDB
    const users = await UserModel.query('username').eq(email).exec();
    const tier = users && users.length > 0 ? users[0].tier : 0;

    res.json({
      valid: true,
      user: {
        username: cognitoUser.Username,
        email,
        tier,
      },
    });
  } catch (error: any) {
    console.error('Error verifying token:', error);

    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({
        valid: false,
        error: 'Invalid or expired token'
      });
    }

    res.status(401).json({
      valid: false,
      error: 'Failed to verify token'
    });
  }
}

/**
 * Admin: Confirm user email (for development)
 * POST /api/auth/confirm
 */
export async function confirmUser(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing required field: email'
      });
    }

    // Admin confirm user in Cognito
    const confirmCommand = new AdminConfirmSignUpCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });

    await cognitoClient.send(confirmCommand);

    res.json({
      success: true,
      message: 'User confirmed successfully. You can now login.',
      email,
    });
  } catch (error: any) {
    console.error('Error confirming user:', error);

    if (error.name === 'UserNotFoundException') {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(500).json({
      error: 'Failed to confirm user',
      message: error.message || 'Unknown error'
    });
  }
}
