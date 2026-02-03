import { Response, Request } from 'express';
import { AccessControlModel, ChatbotModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

/**
 * List all users with access to a chatbot
 * GET /api/access-control/:chatbotId
 */
export async function listAccessControl(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Query all access control records for this chatbot
    const records = await AccessControlModel.query('chatbotId')
      .eq(chatbotId)
      .exec();

    const users = records.map((record: any) => ({
      email: record.email,
      username: record.username,
      name: record.name,
      picture: record.picture,
      grantedBy: record.grantedBy,
      grantedTime: record.grantedTime,
      grantedType: record.grantedType,
    }));

    res.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error listing access control:', error);
    res.status(500).json({
      error: 'Failed to list access control',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Grant access to a user (send invitation)
 * POST /api/access-control/:chatbotId
 */
export async function grantAccess(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { email, name, language } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Create access control record
    const record = new AccessControlModel({
      chatbotId,
      email,
      name: name || '',
      grantedBy: req.user.email,
      grantedTime: new Date().toISOString(),
      grantedType: 'whitelist',
    });

    await record.save();

    // TODO: Send invitation email to the user
    // TODO: Support multi-language email templates

    res.status(201).json({
      success: true,
      message: 'Access granted successfully',
      user: {
        email: record.email,
        name: record.name,
        grantedTime: record.grantedTime,
      },
    });
  } catch (error) {
    console.error('Error granting access:', error);
    res.status(500).json({
      error: 'Failed to grant access',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Revoke access from a user
 * DELETE /api/access-control/:chatbotId/:email
 */
export async function revokeAccess(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, email } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Delete access control record
    await AccessControlModel.delete({ chatbotId, email });

    res.json({
      success: true,
      message: 'Access revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking access:', error);
    res.status(500).json({
      error: 'Failed to revoke access',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Set access mode for chatbot
 * PUT /api/access-control/:chatbotId/mode
 */
export async function setAccessMode(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { mode } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!['public', 'private', 'whitelist'].includes(mode)) {
      return res.status(400).json({
        error: 'Invalid mode. Must be: public, private, or whitelist',
      });
    }

    // Update chatbot access mode
    await ChatbotModel.update({ chatbotId }, { accessMode: mode });

    res.json({
      success: true,
      message: 'Access mode updated successfully',
      mode,
    });
  } catch (error) {
    console.error('Error setting access mode:', error);
    res.status(500).json({
      error: 'Failed to set access mode',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Generate API key for chatbot
 * POST /api/access-control/:chatbotId/apikey
 */
export async function generateApiKey(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get chatbot
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Generate new API key
    const apiKey = `corpus_${nanoid(32)}`;

    // Hash the API key using PBKDF2
    const salt = chatbot.apiKeyHashSalt || nanoid(16);
    const iterations = chatbot.apiKeyHashIterations || 10000;

    const hashedApiKey = crypto
      .pbkdf2Sync(apiKey, salt, iterations, 64, 'sha512')
      .toString('hex');

    // Update chatbot with new hashed key
    await ChatbotModel.update(
      { chatbotId },
      {
        hashedApiKey,
        apiKeyHashSalt: salt,
        apiKeyHashIterations: iterations,
      }
    );

    res.json({
      success: true,
      message: 'API key generated successfully',
      apiKey, // Only returned once
      warning: 'Save this API key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({
      error: 'Failed to generate API key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Validate API key (PUBLIC endpoint)
 * POST /api/access-control/validate
 */
export async function validateApiKey(req: Request, res: Response) {
  try {
    const { chatbotId, apiKey } = req.body;

    if (!chatbotId || !apiKey) {
      return res.status(400).json({
        error: 'chatbotId and apiKey are required',
      });
    }

    // Get chatbot
    const chatbot = await ChatbotModel.get(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Hash the provided API key
    const salt = chatbot.apiKeyHashSalt;
    const iterations = chatbot.apiKeyHashIterations || 10000;

    const hashedApiKey = crypto
      .pbkdf2Sync(apiKey, salt, iterations, 64, 'sha512')
      .toString('hex');

    // Compare hashes
    const isValid = hashedApiKey === chatbot.hashedApiKey;

    if (!isValid) {
      return res.status(401).json({
        valid: false,
        error: 'Invalid API key',
      });
    }

    res.json({
      valid: true,
      chatbotId,
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({
      error: 'Failed to validate API key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
