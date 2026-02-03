import { Response } from 'express';
import { CustomizationModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Get customization for a chatbot
 * GET /api/customize/:chatbotId
 */
export async function getCustomization(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Query all customization records for this chatbot
    const records = await CustomizationModel.query('chatbotId')
      .eq(chatbotId)
      .exec();

    // Transform records into a structured object
    const customization: Record<string, any> = {
      chatbotId,
      colors: {},
      welcomeMessage: '',
      systemPrompt: '',
      gptVersion: 'gpt-3.5-turbo',
      showCitations: true,
      avatar: '',
      chatbotName: '',
      language: 'en',
    };

    records.forEach((record: any) => {
      if (record.type.startsWith('color_')) {
        const colorKey = record.type.replace('color_', '');
        customization.colors[colorKey] = record.value;
      } else {
        customization[record.type] = record.value;
      }
    });

    res.json({
      success: true,
      customization,
    });
  } catch (error) {
    console.error('Error getting customization:', error);
    res.status(500).json({
      error: 'Failed to get customization',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update customization for a chatbot
 * PUT /api/customize/:chatbotId
 */
export async function updateCustomization(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      colors,
      welcomeMessage,
      systemPrompt,
      gptVersion,
      showCitations,
      avatar,
      chatbotName,
      language,
    } = req.body;

    // Update/create customization records
    const updates: Promise<any>[] = [];

    // Handle colors
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        const record = new CustomizationModel({
          chatbotId,
          username,
          type: `color_${key}`,
          value: value as string,
          language: language || 'en',
        });
        updates.push(record.save());
      });
    }

    // Handle other fields
    const fields: Record<string, any> = {
      welcomeMessage,
      systemPrompt,
      gptVersion,
      showCitations: showCitations?.toString(),
      avatar,
      chatbotName,
      language,
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        const record = new CustomizationModel({
          chatbotId,
          username,
          type: key,
          value: value,
          language: language || 'en',
        });
        updates.push(record.save());
      }
    });

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Customization updated successfully',
    });
  } catch (error) {
    console.error('Error updating customization:', error);
    res.status(500).json({
      error: 'Failed to update customization',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update theme colors
 * POST /api/customize/:chatbotId/theme
 */
export async function updateTheme(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;
    const { primary, secondary, accent } = req.body;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const updates: Promise<any>[] = [];

    if (primary) {
      const record = new CustomizationModel({
        chatbotId,
        username,
        type: 'color_primary',
        value: primary,
        language: 'en',
      });
      updates.push(record.save());
    }

    if (secondary) {
      const record = new CustomizationModel({
        chatbotId,
        username,
        type: 'color_secondary',
        value: secondary,
        language: 'en',
      });
      updates.push(record.save());
    }

    if (accent) {
      const record = new CustomizationModel({
        chatbotId,
        username,
        type: 'color_accent',
        value: accent,
        language: 'en',
      });
      updates.push(record.save());
    }

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Theme colors updated successfully',
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({
      error: 'Failed to update theme',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update system prompt
 * POST /api/customize/:chatbotId/prompt
 */
export async function updateSystemPrompt(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;
    const { systemPrompt } = req.body;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!systemPrompt) {
      return res.status(400).json({ error: 'System prompt is required' });
    }

    const record = new CustomizationModel({
      chatbotId,
      username,
      type: 'systemPrompt',
      value: systemPrompt,
      language: 'en',
    });

    await record.save();

    res.json({
      success: true,
      message: 'System prompt updated successfully',
    });
  } catch (error) {
    console.error('Error updating system prompt:', error);
    res.status(500).json({
      error: 'Failed to update system prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
