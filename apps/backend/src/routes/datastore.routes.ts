import { Router } from 'express';
import {
  listDataRecords,
  addDataRecord,
  updateDataRecord,
  deleteDataRecord,
  batchAddDataRecords,
  batchDeleteDataRecords,
} from '../controllers/datastore.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Data Store Routes (All protected with authentication)
 */

// List all data records
router.get('/:chatbotId', authenticateToken, listDataRecords);

// Add single data record
router.post('/:chatbotId', authenticateToken, addDataRecord);

// Update data record
router.put('/:chatbotId/:dataId', authenticateToken, updateDataRecord);

// Delete data record
router.delete('/:chatbotId/:dataId', authenticateToken, deleteDataRecord);

// Batch add records
router.post('/:chatbotId/batch', authenticateToken, batchAddDataRecords);

// Batch delete records
router.delete('/:chatbotId/batch', authenticateToken, batchDeleteDataRecords);

export default router;
