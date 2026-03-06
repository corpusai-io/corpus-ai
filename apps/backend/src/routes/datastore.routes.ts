import { Router } from 'express';
import {
  listDataRecords,
  addDataRecord,
  updateDataRecord,
  deleteDataRecord,
  batchAddDataRecords,
  batchDeleteDataRecords,
  getViewUrl,
  createViewToken,
  downloadByToken,
} from '../controllers/datastore.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { sanitizeBody } from '../middleware/validation.middleware';

const router = Router();

/**
 * Data Store Routes (All protected with authentication)
 */

// Download file using one-time token (no auth header — used via window.open)
// Must be BEFORE /:chatbotId to avoid "download" matching as a chatbotId
router.get('/download', downloadByToken as any);

// List all data records
router.get('/:chatbotId', authenticateToken, listDataRecords);

// Add single data record
router.post('/:chatbotId', authenticateToken, sanitizeBody, addDataRecord);

// Update data record
router.put('/:chatbotId/:dataId', authenticateToken, sanitizeBody, updateDataRecord);

// Delete data record (uses POST with body to support URLs as dataId)
router.post('/:chatbotId/delete', authenticateToken, deleteDataRecord);

// Get presigned view URL for a document (legacy)
router.post('/:chatbotId/view', authenticateToken, getViewUrl);

// Generate a one-time download token (authenticated)
router.post('/:chatbotId/view-token', authenticateToken, createViewToken);

// Legacy delete route (kept for non-URL dataIds)
router.delete('/:chatbotId/:dataId', authenticateToken, deleteDataRecord);

// Batch add records
router.post('/:chatbotId/batch', authenticateToken, sanitizeBody, batchAddDataRecords);

// Batch delete records
router.delete('/:chatbotId/batch', authenticateToken, batchDeleteDataRecords);

export default router;
