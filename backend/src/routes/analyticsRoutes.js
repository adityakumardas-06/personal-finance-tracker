import express from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import {
  getMonthlyAnalytics,
  getCategoryBreakdown,
  getIncomeVsExpense,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/monthly', authRequired, getMonthlyAnalytics);
router.get('/category', authRequired, getCategoryBreakdown);
router.get('/income-expense', authRequired, getIncomeVsExpense);

export default router;
