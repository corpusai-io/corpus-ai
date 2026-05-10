import { Request, Response } from 'express';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AdminConfirmSignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserModel } from '@corpusai/aws-common';
import { sendWelcomeEmail } from '../services/email.service';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_COGNITO_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;
// Full Cognito hosted UI domain, e.g. "eu-north-1turu9jdil.auth.eu-north-1.amazoncognito.com"
// Accepts with or without https:// prefix
const COGNITO_DOMAIN = (process.env.AWS_COGNITO_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_SSO_CALLBACK_URL || 'http://localhost:8001/api/auth/google/callback';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:8080';
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:3000';

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
    let users = await UserModel.query('username').eq(email).exec();

    // If Cognito auth succeeded but user not in local DB, auto-create the record
    // This handles fresh local DynamoDB or DB migration scenarios
    if (!users || users.length === 0) {
      // Fetch user attributes from Cognito to populate the record
      const getUserCommand = new GetUserCommand({
        AccessToken: AccessToken!,
      });
      const cognitoUser = await cognitoClient.send(getUserCommand);
      const nameAttr = cognitoUser.UserAttributes?.find(attr => attr.Name === 'name');

      const newUser = new UserModel({
        username: email,
        customer: `cus_free_${Date.now()}`,
        email,
        name: nameAttr?.Value || email.split('@')[0],
        chat_usage: 0,
        tier: 0,
        customer_type: 'stripe',
        resetAt: Date.now(),
        since: Date.now(),
        expireAt: Date.now() + (10 * 24 * 60 * 60 * 1000), // 10 day trial
      });

      await newUser.save();
      console.log(`✅ Auto-created local DB record for Cognito user: ${email}`);

      users = await UserModel.query('username').eq(email).exec();
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
      IdToken: IdToken, // Cognito ID token (JWT)
      AccessToken: AccessToken,
      RefreshToken: RefreshToken,
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

/**
 * POST /api/auth/confirm-signup
 * User self-confirmation with verification code from email
 */
export async function confirmSignUp(req: Request, res: Response) {
  try {
    const { email, code } = req.body;

    console.log('🔍 [AUTH] Confirm signup endpoint called');
    console.log('Request body:', { email, code: code ? '***' : undefined });

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing required fields: email and code'
      });
    }

    // Confirm user signup with verification code
    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    console.log('Sending ConfirmSignUpCommand to Cognito...');
    await cognitoClient.send(confirmCommand);

    console.log('✅ User confirmed successfully');

    // Send welcome email after successful verification (not during registration)
    try {
      const users = await UserModel.query('username').eq(email).exec();
      const userName = users.length > 0 ? (users[0].name || email.split('@')[0]) : email.split('@')[0];
      sendWelcomeEmail(email, userName);
    } catch (e) {
      // Still send with fallback name
      sendWelcomeEmail(email, email.split('@')[0]);
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      email,
    });
  } catch (error: any) {
    console.error('Error confirming signup:', error);

    if (error.name === 'CodeMismatchException') {
      return res.status(400).json({
        error: 'Invalid verification code. Please check and try again.'
      });
    }

    if (error.name === 'ExpiredCodeException') {
      return res.status(400).json({
        error: 'Verification code has expired. Please request a new one.'
      });
    }

    if (error.name === 'UserNotFoundException') {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(500).json({
      error: 'Failed to confirm signup',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Initiate forgot password flow
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing required field: email'
      });
    }

    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(command);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset code has been sent.',
    });
  } catch (error: any) {
    console.error('Error initiating forgot password:', error);

    if (error.name === 'UserNotFoundException') {
      // Don't reveal whether user exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
      });
    }

    if (error.name === 'LimitExceededException') {
      return res.status(429).json({
        error: 'Too many attempts. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Failed to initiate password reset',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Confirm forgot password with code and new password
 * POST /api/auth/confirm-forgot-password
 */
export async function confirmForgotPassword(req: Request, res: Response) {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields: email, code, newPassword'
      });
    }

    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Error confirming forgot password:', error);

    if (error.name === 'CodeMismatchException') {
      return res.status(400).json({
        error: 'Invalid verification code. Please check and try again.'
      });
    }

    if (error.name === 'ExpiredCodeException') {
      return res.status(400).json({
        error: 'Verification code has expired. Please request a new one.'
      });
    }

    if (error.name === 'InvalidPasswordException') {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        message: error.message
      });
    }

    if (error.name === 'UserNotFoundException') {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(500).json({
      error: 'Failed to reset password',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Refresh access token using Cognito refresh token
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing required field: refreshToken'
      });
    }

    const authParams: Record<string, string> = {
      REFRESH_TOKEN: refreshToken,
    };

    // If client secret is configured, include SECRET_HASH
    const clientSecret = process.env.AWS_COGNITO_CLIENT_SECRET;
    if (clientSecret) {
      // For refresh token auth with a client secret, Cognito requires SECRET_HASH
      // but since we don't have the username readily available from the refresh token,
      // and some app clients don't use secrets, we handle this gracefully
      // Note: If your app client has a secret, you may need to compute SECRET_HASH here
    }

    const authCommand = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      ClientId: CLIENT_ID,
      AuthParameters: authParams,
    });

    const authResponse = await cognitoClient.send(authCommand);

    if (!authResponse.AuthenticationResult) {
      return res.status(401).json({
        error: 'Token refresh failed'
      });
    }

    const { IdToken, AccessToken } = authResponse.AuthenticationResult;

    res.json({
      success: true,
      IdToken,
      AccessToken,
    });
  } catch (error: any) {
    console.error('Error refreshing token:', error);

    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({
        error: 'Refresh token is expired or invalid. Please sign in again.'
      });
    }

    res.status(500).json({
      error: 'Failed to refresh token',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Initiate Google SSO via Cognito Hosted UI
 * GET /api/auth/google
 */
export async function googleSSO(req: Request, res: Response) {
  try {
    if (!COGNITO_DOMAIN || !CLIENT_ID) {
      return res.status(500).json({
        error: 'Google SSO not configured. Missing COGNITO_DOMAIN or CLIENT_ID.'
      });
    }

    // Build the Cognito authorization URL with Google as identity provider
    const cognitoAuthUrl = new URL(`https://${COGNITO_DOMAIN}/oauth2/authorize`);
    cognitoAuthUrl.searchParams.set('identity_provider', 'Google');
    cognitoAuthUrl.searchParams.set('response_type', 'code');
    cognitoAuthUrl.searchParams.set('client_id', CLIENT_ID);
    cognitoAuthUrl.searchParams.set('redirect_uri', GOOGLE_CALLBACK_URL);
    cognitoAuthUrl.searchParams.set('scope', 'email openid profile');

    res.redirect(cognitoAuthUrl.toString());
  } catch (error: any) {
    console.error('Error initiating Google SSO:', error);
    res.status(500).json({
      error: 'Failed to initiate Google sign-in',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Handle Google SSO callback from Cognito Hosted UI
 * GET /api/auth/google/callback
 */
export async function googleSSOCallback(req: Request, res: Response) {
  try {
    const { code, error: oauthError, error_description } = req.query;

    // Handle OAuth errors (user denied, etc.)
    if (oauthError) {
      console.error('Google SSO OAuth error:', oauthError, error_description);
      return res.redirect(
        `${WEBSITE_URL}/Sign-In?error=${encodeURIComponent(String(error_description || oauthError))}`
      );
    }

    if (!code) {
      return res.redirect(`${WEBSITE_URL}/Sign-In?error=${encodeURIComponent('No authorization code received')}`);
    }

    if (!COGNITO_DOMAIN || !CLIENT_ID) {
      return res.redirect(`${WEBSITE_URL}/Sign-In?error=${encodeURIComponent('SSO not configured')}`);
    }

    // Exchange authorization code for tokens via Cognito token endpoint
    const tokenUrl = `https://${COGNITO_DOMAIN}/oauth2/token`;

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: String(code),
      redirect_uri: GOOGLE_CALLBACK_URL,
    });

    // If client secret is configured (optional — only needed if app client has a secret)
    const clientSecret = process.env.AWS_COGNITO_CLIENT_SECRET;
    if (clientSecret) {
      tokenBody.set('client_secret', clientSecret);
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Cognito token exchange failed:', errorData);
      return res.redirect(`${WEBSITE_URL}/Sign-In?error=${encodeURIComponent('Token exchange failed')}`);
    }

    const tokenData = await tokenResponse.json();
    const { id_token, access_token, refresh_token } = tokenData;
    console.log(`[sso] Token exchange OK — access_token prefix: ${access_token?.substring(0, 20)}... | is_jwt: ${access_token?.startsWith('eyJ')}`);

    // Decode the id_token JWT to extract user info (no verification needed —
    // we just received it directly from Cognito's token endpoint over HTTPS)
    const idTokenPayload = JSON.parse(
      Buffer.from(id_token.split('.')[1], 'base64url').toString('utf-8')
    );

    const email = idTokenPayload.email || idTokenPayload['cognito:username'];
    const name = idTokenPayload.name || email.split('@')[0];
    const picture = idTokenPayload.picture || '';

    // Find or create user in DynamoDB
    let users = await UserModel.query('username').eq(email).exec();

    if (!users || users.length === 0) {
      // First-time Google SSO user — create DynamoDB record
      const newUser = new UserModel({
        username: email,
        customer: `cus_free_${Date.now()}`,
        email,
        name,
        picture,
        chat_usage: 0,
        tier: 0,
        customer_type: 'stripe',
        resetAt: Date.now(),
        since: Date.now(),
        expireAt: Date.now() + (10 * 24 * 60 * 60 * 1000), // 10 day trial
      });

      await newUser.save();
      console.log(`✅ Created new user via Google SSO: ${email}`);
      users = await UserModel.query('username').eq(email).exec();
    } else {
      // Existing user — update name/picture from Google if they changed
      const existingUser = users[0];
      if (name && name !== existingUser.name) {
        existingUser.name = name;
      }
      if (picture && picture !== existingUser.picture) {
        existingUser.picture = picture;
      }
      await existingUser.save();
    }

    const user = users[0];

    // Build the auth payload to pass to Dashboard (same format as regular login)
    const tokens = {
      idToken: id_token,
      accessToken: access_token,
      refreshToken: refresh_token,
      user: {
        username: user.username,
        email: user.email,
        name: user.name,
        tier: user.tier,
        chat_usage: user.chat_usage,
        since: user.since,
        expireAt: user.expireAt,
      },
    };

    // Redirect to dashboard with tokens in URL hash (same mechanism as regular login)
    const dashboardUrl = `${DASHBOARD_URL}/#auth=${encodeURIComponent(JSON.stringify(tokens))}`;
    console.log(`[sso] ✅ Login complete — user: ${email} | redirecting to: ${DASHBOARD_URL}/#auth=...`);
    res.redirect(dashboardUrl);
  } catch (error: any) {
    console.error('Error in Google SSO callback:', error);
    res.redirect(
      `${WEBSITE_URL}/Sign-In?error=${encodeURIComponent('Google sign-in failed. Please try again.')}`
    );
  }
}
