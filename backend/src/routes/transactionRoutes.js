import express from 'express';
import { authRequired, requireRole } from '../middleware/authMiddleware.js';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

// sab roles dekh sakte hain
router.get('/', authRequired, getTransactions);

// sirf admin + user change kar sakte
router.post('/', authRequired, requireRole(['admin', 'user']), createTransaction);
router.put('/:id', authRequired, requireRole(['admin', 'user']), updateTransaction);
router.delete('/:id', authRequired, requireRole(['admin', 'user']), deleteTransaction);

export default router;