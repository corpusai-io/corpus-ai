import { Response } from 'express';
import { UserModel, ChatbotModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
  DeleteUserCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-west-2',
});

/**
 * Get user profile
 * GET /api/user/profile
 */
export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from DynamoDB
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    res.json({
      success: true,
      profile: {
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture,
        tier: user.tier,
        chatUsage: user.chat_usage,
        customer: user.customer,
        customerType: user.customer_type,
        since: user.since,
        resetAt: user.resetAt,
        expireAt: user.expireAt,
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update user profile
 * PUT /api/user/profile
 */
export async function updateUserProfile(req: AuthRequest, res: Response) {
  try {
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, picture } = req.body;

    // Get existing user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Update user
    await UserModel.update(
      { username, customer: user.customer },
      {
        ...(name !== undefined && { name }),
        ...(picture !== undefined && { picture }),
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Failed to update user profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Change password
 * PUT /api/user/password
 */
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: 'oldPassword and newPassword are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
    }

    // Change password in Cognito
    const command = new ChangePasswordCommand({
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword,
      AccessToken: accessToken,
    });

    await cognitoClient.send(command);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Error changing password:', error);

    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({
        error: 'Current password is incorrect',
      });
    }

    if (error.name === 'InvalidPasswordException') {
      return res.status(400).json({
        error: 'New password does not meet requirements',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to change password',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Delete user account
 * DELETE /api/user/account
 */
export async function deleteUserAccount(req: AuthRequest, res: Response) {
  try {
    const username = req.user?.email;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!username || !accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Confirm deletion with password
    const { password, confirmDelete } = req.body;

    if (!password || confirmDelete !== 'DELETE') {
      return res.status(400).json({
        error: 'Password and confirmation (type "DELETE") are required',
      });
    }

    // Get all user's chatbots
    const chatbots = await ChatbotModel.query('username').eq(username).exec();

    // Delete all chatbots
    await Promise.all(
      chatbots.map((chatbot) =>
        ChatbotModel.delete({ chatbotId: chatbot.chatbotId })
      )
    );

    // Delete user from DynamoDB
    const users = await UserModel.query('username').eq(username).exec();
    if (users.length > 0) {
      await UserModel.delete({
        username,
        customer: users[0].customer,
      });
    }

    // Delete user from Cognito
    const deleteCommand = new DeleteUserCommand({
      AccessToken: accessToken,
    });

    await cognitoClient.send(deleteCommand);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user account:', error);

    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({
        error: 'Invalid password',
      });
    }

    res.status(500).json({
      error: 'Failed to delete account',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get user statistics
 * GET /api/user/stats
 */
export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get chatbot count
    const chatbots = await ChatbotModel.query('username').eq(username).exec();

    // Calculate total file size usage
    let totalFileSize = 0;
    let totalWebCount = 0;

    chatbots.forEach((chatbot) => {
      totalFileSize += chatbot.fileSizeUsage || 0;
      totalWebCount += chatbot.webCountUsage || 0;
    });

    res.json({
      success: true,
      stats: {
        chatbotCount: chatbots.length,
        chatUsage: user.chat_usage || 0,
        fileSizeUsage: totalFileSize,
        webCountUsage: totalWebCount,
        tier: user.tier,
        since: user.since,
        accountAge: user.since ? Math.floor((Date.now() - user.since) / (1000 * 60 * 60 * 24)) : 0,
      },
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      error: 'Failed to get user stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
