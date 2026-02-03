import { Response } from 'express';
import { dataStore, getDataStoreRecords } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { nanoid } from 'nanoid';

/**
 * List all data records for a chatbot
 * GET /api/data-store/:chatbotId
 */
export async function listDataRecords(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all data store records
    const records = await getDataStoreRecords(username, chatbotId);

    // Transform records for response
    const transformedRecords = records.map((record) => ({
      dataId: record.dataSource,
      source: record.dataSource,
      type: record.dataType || 'unknown',
      size: record.dataSize || 0,
      createdAt: record.dataCreatedAt,
      updatedAt: record.dataUpdatedAt,
      skipped: record.skipped || false,
    }));

    res.json({
      success: true,
      records: transformedRecords,
      total: transformedRecords.length,
    });
  } catch (error) {
    console.error('Error listing data records:', error);
    res.status(500).json({
      error: 'Failed to list data records',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Add a single data record
 * POST /api/data-store/:chatbotId
 */
export async function addDataRecord(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { source, type, content, size } = req.body;

    if (!source || !type) {
      return res.status(400).json({
        error: 'Missing required fields: source, type',
      });
    }

    // Create data store record
    const record = await dataStore
      .create({
        username,
        chatbotId,
        dataSource: source,
        dataType: type,
        dataSize: size || 0,
      })
      .go();

    res.status(201).json({
      success: true,
      record: {
        dataId: record.data.dataSource,
        source: record.data.dataSource,
        type: record.data.dataType,
        size: record.data.dataSize,
        createdAt: record.data.dataCreatedAt,
      },
    });
  } catch (error) {
    console.error('Error adding data record:', error);
    res.status(500).json({
      error: 'Failed to add data record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update a data record
 * PUT /api/data-store/:chatbotId/:dataId
 */
export async function updateDataRecord(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, dataId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { size, skipped } = req.body;

    // Update record
    const record = await dataStore
      .patch({
        username,
        chatbotId,
        dataSource: dataId,
      })
      .set({
        ...(size !== undefined && { dataSize: size }),
        ...(skipped !== undefined && { skipped }),
      })
      .go();

    res.json({
      success: true,
      record: record.data,
    });
  } catch (error) {
    console.error('Error updating data record:', error);
    res.status(500).json({
      error: 'Failed to update data record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Delete a data record
 * DELETE /api/data-store/:chatbotId/:dataId
 */
export async function deleteDataRecord(req: AuthRequest, res: Response) {
  try {
    const { chatbotId, dataId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Delete record
    await dataStore
      .delete({
        username,
        chatbotId,
        dataSource: dataId,
      })
      .go();

    res.json({
      success: true,
      message: 'Data record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting data record:', error);
    res.status(500).json({
      error: 'Failed to delete data record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Batch add data records
 * POST /api/data-store/:chatbotId/batch
 */
export async function batchAddDataRecords(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        error: 'Invalid or empty records array',
      });
    }

    // Create all records
    const createdRecords = await Promise.all(
      records.map((record: any) =>
        dataStore
          .create({
            username,
            chatbotId,
            dataSource: record.source,
            dataType: record.type,
            dataSize: record.size || 0,
          })
          .go()
      )
    );

    res.status(201).json({
      success: true,
      count: createdRecords.length,
      records: createdRecords.map((r) => r.data),
    });
  } catch (error) {
    console.error('Error batch adding data records:', error);
    res.status(500).json({
      error: 'Failed to batch add data records',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Batch delete data records
 * DELETE /api/data-store/:chatbotId/batch
 */
export async function batchDeleteDataRecords(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { dataIds } = req.body;

    if (!Array.isArray(dataIds) || dataIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid or empty dataIds array',
      });
    }

    // Delete all records
    await Promise.all(
      dataIds.map((dataId: string) =>
        dataStore
          .delete({
            username,
            chatbotId,
            dataSource: dataId,
          })
          .go()
      )
    );

    res.json({
      success: true,
      count: dataIds.length,
      message: 'Data records deleted successfully',
    });
  } catch (error) {
    console.error('Error batch deleting data records:', error);
    res.status(500).json({
      error: 'Failed to batch delete data records',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
