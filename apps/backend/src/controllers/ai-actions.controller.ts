import { Response } from 'express';
import { AiActionsModel, ChatbotModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { errorResponse, ErrorCodes } from '../utils/error-response';

/**
 * Verify the requesting user owns the chatbot
 */
async function verifyOwnership(chatbotId: string, email: string): Promise<boolean> {
  const bots = await ChatbotModel.query('username').eq(email).exec();
  return bots.some((b: any) => b.chatbotId === chatbotId);
}

/**
 * GET /api/ai-actions/:chatbotId
 * Returns the stored AI actions config for a chatbot.
 */
export async function getAiActions(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const owned = await verifyOwnership(chatbotId, req.user.email);
    if (!owned) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');
    }

    const record = await AiActionsModel.get(chatbotId);

    if (!record) {
      return res.json({ success: true, buttonActions: [], formActions: [], builtins: [] });
    }

    return res.json({
      success: true,
      buttonActions: JSON.parse(record.buttonActions || '[]'),
      formActions: JSON.parse(record.formActions || '[]'),
      builtins: JSON.parse(record.builtins || '[]'),
    });
  } catch (error) {
    console.error('Error getting AI actions:', error);
    return errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to get AI actions');
  }
}

/**
 * PUT /api/ai-actions/:chatbotId
 * Saves (upserts) the full AI actions config for a chatbot.
 */
export async function saveAiActions(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    if (!req.user) {
      return errorResponse(res, 401, ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const owned = await verifyOwnership(chatbotId, req.user.email);
    if (!owned) {
      return errorResponse(res, 403, ErrorCodes.ACCESS_DENIED, 'Access denied');
    }

    const { buttonActions, formActions, builtins } = req.body;

    if (!Array.isArray(buttonActions) || !Array.isArray(formActions) || !Array.isArray(builtins)) {
      return errorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, 'buttonActions, formActions, and builtins must be arrays');
    }

    await AiActionsModel.update(
      { chatbotId },
      {
        buttonActions: JSON.stringify(buttonActions),
        formActions: JSON.stringify(formActions),
        builtins: JSON.stringify(builtins),
        updatedAt: Date.now(),
      }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving AI actions:', error);
    return errorResponse(res, 500, ErrorCodes.INTERNAL_ERROR, 'Failed to save AI actions');
  }
}
