import { Response } from 'express';
import { dataStore, getDataStoreRecords, getOrCreateIndex, getPresignedUrl, getChatbotFilePath, uploadFileToS3, downloadFileFromS3, sanitizeForId } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { nanoid } from 'nanoid';

const PINECONE_INDEX = process.env.PINECONE_INDEX || 'corpus-dense';

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
      pageCount: record.pageCount || 0,
      crawledPages: record.crawledPages || 0,
      s3Key: record.s3Key || '',
      status: record.status || 'active',
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

    // Check for existing record with the same dataSource
    let existingRecord: any = null;
    try {
      const existing = await dataStore.get({ username, chatbotId, dataSource: source }).go();
      existingRecord = existing.data;
    } catch (e) { /* not found — proceed */ }

    // URLs: reject duplicates outright
    if (type === 'web' && existingRecord) {
      return res.status(409).json({
        error: 'Duplicate data source',
        message: `A URL source "${source}" already exists for this chatbot. Delete it first if you want to re-crawl.`,
      });
    }

    // For plain text (manual/text type), store content as .txt file in S3 so it's retrievable
    let storedS3Key: string | undefined;
    if ((type === 'manual' || type === 'text') && content) {
      try {
        const txtFilename = `${source.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
        storedS3Key = getChatbotFilePath(chatbotId, txtFilename);
        await uploadFileToS3({
          key: storedS3Key,
          body: content,
          contentType: 'text/plain',
          metadata: { chatbotId, originalFilename: encodeURIComponent(source) },
        });
        console.log(`[Datastore] Stored plain text "${source}" as ${storedS3Key}`);
      } catch (uploadErr: any) {
        console.error(`[Datastore] Failed to store plain text in S3:`, uploadErr.message);
        storedS3Key = undefined;
      }
    }

    // Text/files: if record already exists, clean up old Pinecone vectors before replacing
    if (existingRecord && (type === 'manual' || type === 'text' || type === 'file')) {
      try {
        const index = await getOrCreateIndex(PINECONE_INDEX);
        const ns = index.namespace(chatbotId);
        const listResult = await ns.listPaginated({ prefix: `${sanitizeForId(source)}-` });
        const vectorIds = (listResult.vectors || []).map((v: any) => v.id);
        if (vectorIds.length > 0) {
          await ns.deleteMany(vectorIds);
          console.log(`[Datastore] Cleaned up ${vectorIds.length} old vectors for replaced source "${source}"`);
        }
      } catch (e: any) {
        console.warn(`[Datastore] Could not clean up old vectors for "${source}":`, e.message);
      }
    }

    // Create or replace data store record
    // Web URLs and text/manual records start as 'processing' since they need embedding;
    // other document types are handled by the file upload build pipeline
    const initialStatus = (type === 'web' || type === 'manual' || type === 'text') ? 'processing' : 'active';
    const isReplace = !!existingRecord;

    // URLs use .create() (duplicates already rejected above);
    // Text/files use .put() to allow replacing existing content
    const record = isReplace
      ? await dataStore.put({
          username,
          chatbotId,
          dataSource: source,
          dataType: type,
          dataSize: size || (content ? content.length : 0),
          ...(storedS3Key && { s3Key: storedS3Key }),
          status: initialStatus,
        }).go()
      : await dataStore.create({
          username,
          chatbotId,
          dataSource: source,
          dataType: type,
          dataSize: size || 0,
          ...(storedS3Key && { s3Key: storedS3Key }),
          status: initialStatus,
        }).go();

    res.status(isReplace ? 200 : 201).json({
      success: true,
      replaced: isReplace,
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
    const { chatbotId } = req.params;
    // Support dataId from URL param (legacy) or request body (for URLs with slashes)
    const dataId = req.params.dataId || req.body?.dataId;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!dataId) {
      return res.status(400).json({ error: 'Missing dataId' });
    }

    // Delete record
    await dataStore
      .delete({
        username,
        chatbotId,
        dataSource: dataId,
      })
      .go();

    // Best-effort: clean up associated vectors from Pinecone
    // Vector IDs follow the pattern: {source}-chunk-{N} and {source}-parent-{N}
    try {
      const index = await getOrCreateIndex(PINECONE_INDEX);
      const ns = index.namespace(chatbotId);
      // List vectors with the source prefix and delete by ID
      const listResult = await ns.listPaginated({ prefix: `${sanitizeForId(dataId)}-` });
      const vectorIds = (listResult.vectors || []).map((v: any) => v.id);
      if (vectorIds.length > 0) {
        await ns.deleteMany(vectorIds);
        console.log(`[Datastore] Deleted ${vectorIds.length} vectors for source "${dataId}" in namespace "${chatbotId}"`);
      } else {
        console.log(`[Datastore] No vectors found with prefix "${dataId}-" in namespace "${chatbotId}"`);
      }
    } catch (vectorError: any) {
      // Non-fatal: record is already deleted from DynamoDB
      console.warn(`[Datastore] Could not clean up vectors for "${dataId}": ${vectorError.message}`);
    }

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

    // Best-effort: clean up associated vectors from Pinecone for each deleted source
    try {
      const index = await getOrCreateIndex(PINECONE_INDEX);
      const ns = index.namespace(chatbotId);
      for (const id of dataIds) {
        try {
          const listResult = await ns.listPaginated({ prefix: `${sanitizeForId(id)}-` });
          const vectorIds = (listResult.vectors || []).map((v: any) => v.id);
          if (vectorIds.length > 0) {
            await ns.deleteMany(vectorIds);
          }
        } catch (e: any) {
          console.warn(`[Datastore] Could not clean up vectors for "${id}": ${e.message}`);
        }
      }
      console.log(`[Datastore] Cleaned up vectors for ${dataIds.length} sources in namespace "${chatbotId}"`);
    } catch (vectorError: any) {
      console.warn(`[Datastore] Failed to batch delete vectors: ${vectorError.message}`);
    }

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

/**
 * Get a presigned download URL for a document
 * POST /api/data-store/:chatbotId/view
 */
export async function getViewUrl(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { dataId } = req.body;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!dataId) {
      return res.status(400).json({ error: 'Missing dataId' });
    }

    // Use the stored s3Key if provided, otherwise fall back to constructing from dataId
    const { s3Key: storedKey } = req.body;
    const s3Key = storedKey || getChatbotFilePath(chatbotId, dataId);
    const url = await getPresignedUrl(s3Key, 3600); // 1 hour expiry

    res.json({ success: true, url });
  } catch (error) {
    console.error('Error generating view URL:', error);
    res.status(500).json({
      error: 'Failed to generate view URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ---------------------------------------------------------------------------
// One-time download tokens (avoids presigned URL clock-skew AND browser
// extension interception issues like IDM hijacking fetch requests).
// Flow: POST /view-token → token, then GET /download?token=xxx → file stream
// ---------------------------------------------------------------------------
interface DownloadToken {
  s3Key: string;
  dataId: string;
  expiresAt: number;
}

const downloadTokens = new Map<string, DownloadToken>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of downloadTokens) {
    if (val.expiresAt < now) downloadTokens.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Generate a one-time download token for a data store file.
 * POST /api/data-store/:chatbotId/view-token
 * Body: { dataId, s3Key? }
 */
export async function createViewToken(req: AuthRequest, res: Response) {
  try {
    const { chatbotId } = req.params;
    const { dataId, s3Key: storedKey } = req.body;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!dataId) {
      return res.status(400).json({ error: 'Missing dataId' });
    }

    const s3Key = storedKey || getChatbotFilePath(chatbotId, dataId);
    const token = nanoid(32);

    downloadTokens.set(token, {
      s3Key,
      dataId,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error creating view token:', error);
    res.status(500).json({ error: 'Failed to create download token' });
  }
}

/**
 * Download a file using a one-time token (no auth header needed — uses
 * window.open / direct navigation so browser extensions don't interfere).
 * GET /api/data-store/download?token=xxx
 */
export async function downloadByToken(_req: AuthRequest, res: Response) {
  try {
    const token = _req.query.token as string;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    const entry = downloadTokens.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      downloadTokens.delete(token);
      return res.status(403).json({ error: 'Token expired or invalid' });
    }

    // Consume the token (one-time use)
    downloadTokens.delete(token);

    const { s3Key, dataId } = entry;

    // Determine content type from the file extension
    const ext = s3Key.split('.').pop()?.toLowerCase() || '';
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      md: 'text/markdown',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    const fileBuffer = await downloadFileFromS3(s3Key);

    const filename = dataId.includes('/') ? dataId.split('/').pop()! : dataId;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file by token:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
}
