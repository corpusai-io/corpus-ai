import { Router } from 'express';
import {
  testDatabaseConnection,
  fetchDatabaseTables,
  saveDatabaseConnection,
  getDatabaseConnections,
  deleteDatabaseConnection,
  refreshDatabaseSchema,
  nlQueryDatabase,
} from '../controllers/database.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Test a database connection
router.post('/test', authenticateToken, testDatabaseConnection);

// Fetch tables from a database
router.post('/tables', authenticateToken, fetchDatabaseTables);

// Save a database connection
router.post('/save', authenticateToken, saveDatabaseConnection);

// List saved connections for a chatbot
router.get('/:chatbotId', authenticateToken, getDatabaseConnections);

// Delete a saved connection
router.delete('/:connectionId', authenticateToken, deleteDatabaseConnection);

// Refresh schema for an existing connection
router.post('/:connectionId/refresh-schema', authenticateToken, refreshDatabaseSchema);

// Natural language query against a chatbot's connected database (for owner testing)
router.post('/:chatbotId/nl-query', authenticateToken, nlQueryDatabase);

export default router;
