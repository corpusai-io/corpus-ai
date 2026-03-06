import { Response } from 'express';
import { CustomizationModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Get public customization for a chatbot (widget embed)
 * GET /api/customize/:chatbotId/public
 * No authentication required - returns only widget-relevant fields.
 */
export async function getCustomizationPublic(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;

    const records = await CustomizationModel.query('chatbotId')
      .eq(chatbotId)
      .exec();

    // Only expose widget-safe fields (no systemPrompt, no internal config)
    const customization: Record<string, any> = {
      chatbotId,
      colors: {},
      welcomeMessage: '',
      showCitations: true,
      avatar: '',
      chatbotName: '',
      language: 'en',
      suggestedQuestions: [],
    };

    const publicFields = new Set([
      'welcomeMessage', 'showCitations', 'avatar', 'chatbotName',
      'language', 'suggestedQuestions',
    ]);

    records.forEach((record: any) => {
      if (record.type.startsWith('color_')) {
        const colorKey = record.type.replace('color_', '');
        customization.colors[colorKey] = record.value;
      } else if (publicFields.has(record.type)) {
        let val: any = record.value;
        try {
          const parsed = JSON.parse(val);
          if (typeof parsed !== 'string') val = parsed;
        } catch {
          if (val === 'true') val = true;
          else if (val === 'false') val = false;
        }
        customization[record.type] = val;
      }
    });

    res.json({
      success: true,
      customization,
    });
  } catch (error) {
    console.error('Error getting public customization:', error);
    res.status(500).json({
      error: 'Failed to get customization',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

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
        // Try to parse JSON values (arrays, objects, booleans)
        let val: any = record.value;
        try {
          const parsed = JSON.parse(val);
          // Only use parsed value for arrays, objects, booleans, numbers
          if (typeof parsed !== 'string') val = parsed;
        } catch {
          // Keep as string - handle boolean strings
          if (val === 'true') val = true;
          else if (val === 'false') val = false;
        }
        customization[record.type] = val;
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
 *
 * Accepts any fields. Values are stored as key-value records.
 * Arrays/objects are JSON-stringified. Existing records for the
 * same chatbotId+type are replaced (upsert).
 */
export async function updateCustomization(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const body = req.body;

    // Flatten all fields into type/value pairs
    const entries: { type: string; value: string }[] = [];

    Object.entries(body).forEach(([key, val]) => {
      if (val === undefined || val === null) return;

      if (key === 'colors' && typeof val === 'object' && !Array.isArray(val)) {
        // Flatten color object into color_<prop> entries
        Object.entries(val as Record<string, string>).forEach(([ck, cv]) => {
          entries.push({ type: `color_${ck}`, value: String(cv) });
        });
      } else if (typeof val === 'object') {
        // Arrays and nested objects are stored as JSON strings
        entries.push({ type: key, value: JSON.stringify(val) });
      } else {
        entries.push({ type: key, value: String(val) });
      }
    });

    // Delete existing records for these types, then create fresh ones (upsert)
    const existingRecords = await CustomizationModel.query('chatbotId')
      .eq(chatbotId)
      .exec();

    const typesToUpdate = new Set(entries.map((e) => e.type));
    const toDelete = existingRecords.filter(
      (r: any) => typesToUpdate.has(r.type),
    );

    // Delete old records
    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map((r: any) =>
          CustomizationModel.delete({ chatbotId, id: r.id }),
        ),
      );
    }

    // Create new records
    await Promise.all(
      entries.map((entry) => {
        const record = new CustomizationModel({
          chatbotId,
          username,
          type: entry.type,
          value: entry.value,
          language: 'en',
        });
        return record.save();
      }),
    );

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
