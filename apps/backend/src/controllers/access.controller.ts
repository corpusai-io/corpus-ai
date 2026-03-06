import { Response, Request } from 'express';
import { AccessControlModel, ChatbotModel, ApiKeyModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendAccessInvitationEmail } from '../services/email.service';
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

    // Fire-and-forget: send invitation email to the user
    try {
      const chatbot = await ChatbotModel.get(chatbotId);
      const chatbotName = chatbot?.title || chatbotId;
      sendAccessInvitationEmail(email, chatbotName, req.user.email);
    } catch (lookupErr) {
      console.warn('[ACCESS] Could not look up chatbot for invitation email:', lookupErr);
    }
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
    const { label } = req.body || {};

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
    const keyId = nanoid(12);
    const keyPrefix = apiKey.substring(0, 12);

    // Hash the API key using PBKDF2
    const salt = nanoid(16);
    const iterations = 10000;

    const hashedKey = crypto
      .pbkdf2Sync(apiKey, salt, iterations, 64, 'sha512')
      .toString('hex');

    // Store in ApiKey table
    const record = new ApiKeyModel({
      chatbotId,
      keyId,
      label: label || '',
      keyPrefix,
      hashedKey,
      salt,
      iterations,
      createdAt: Date.now(),
      lastUsed: 0,
      createdBy: req.user.email,
    });
    await record.save();

    // Also update chatbot's main key for backwards compatibility
    await ChatbotModel.update(
      { chatbotId },
      {
        hashedApiKey: hashedKey,
        apiKeyHashSalt: salt,
        apiKeyHashIterations: iterations,
      }
    );

    res.json({
      success: true,
      message: 'API key generated successfully',
      apiKey, // Only returned once
      keyId,
      keyPrefix,
      label: label || '',
      createdAt: Date.now(),
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
 * List API keys for chatbot
 * GET /api/access-control/:chatbotId/apikeys
 */
export async function listApiKeys(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const records = await ApiKeyModel.query('chatbotId')
      .eq(chatbotId)
      .exec();

    const keys = records.map((r: any) => ({
      keyId: r.keyId,
      label: r.label,
      keyPrefix: r.keyPrefix,
      createdAt: r.createdAt,
      lastUsed: r.lastUsed,
      createdBy: r.createdBy,
    }));

    res.json({
      success: true,
      keys,
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    res.status(500).json({
      error: 'Failed to list API keys',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Delete an API key
 * DELETE /api/access-control/:chatbotId/apikeys/:keyId
 */
export async function deleteApiKey(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, keyId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await ApiKeyModel.delete({ chatbotId, keyId });

    res.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      error: 'Failed to delete API key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Validate API key (PUBLIC endpoint)
 * POST /api/access-control/validate
 *
 * Checks ALL stored API keys for the chatbot (not just the most recent one),
 * using timing-safe comparison to prevent timing attacks.
 */
export async function validateApiKey(req: Request, res: Response) {
  try {
    const { chatbotId, apiKey } = req.body;

    if (!chatbotId || !apiKey) {
      return res.status(400).json({
        error: 'chatbotId and apiKey are required',
      });
    }

    // Verify chatbot exists
    const chatbot = await ChatbotModel.get(chatbotId);
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Fetch all API keys for this chatbot and test each one
    const keys = await ApiKeyModel.query('chatbotId').eq(chatbotId).exec();

    if (!keys || keys.length === 0) {
      return res.status(401).json({ valid: false, error: 'Invalid API key' });
    }

    let matchedKey: any = null;

    for (const keyRecord of keys) {
      try {
        const hashed = crypto
          .pbkdf2Sync(apiKey, keyRecord.salt, keyRecord.iterations || 10000, 64, 'sha512')
          .toString('hex');

        const hashedBuf = Buffer.from(hashed, 'hex');
        const storedBuf = Buffer.from(keyRecord.hashedKey, 'hex');

        if (
          hashedBuf.length === storedBuf.length &&
          crypto.timingSafeEqual(hashedBuf, storedBuf)
        ) {
          matchedKey = keyRecord;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matchedKey) {
      return res.status(401).json({ valid: false, error: 'Invalid API key' });
    }

    // Fire-and-forget: update lastUsed
    matchedKey.lastUsed = Date.now();
    matchedKey.save().catch((err: any) => {
      console.warn('[ACCESS] Failed to update lastUsed for API key:', err);
    });

    res.json({ valid: true, chatbotId });
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({
      error: 'Failed to validate API key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
