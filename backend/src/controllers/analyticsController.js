import { pool } from '../db.js';
import { redisClient, isRedisReady } from '../cache.js';

function userKeyPart(req) {
  return req.user.role === 'admin' ? 'all-users' : `user-${req.user.id}`;
}

// 1) Monthly overview – cache 15 min
export async function getMonthlyAnalytics(req, res) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const key = `analytics:monthly:${userKeyPart(req)}:year:${year}`;

    if (isRedisReady()) {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const params = [year];
    let where = 'WHERE EXTRACT(YEAR FROM transaction_date) = $1';

    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      where += ' AND user_id = $2';
    }

    const query = `
      SELECT
        DATE_TRUNC('month', transaction_date) AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
      FROM transactions
      ${where}
      GROUP BY month
      ORDER BY month;
    `;

    const result = await pool.query(query, params);

    const data = result.rows.map((row) => ({
      month: row.month,
      totalIncome: Number(row.total_income || 0),
      totalExpense: Number(row.total_expense || 0),
    }));

    if (isRedisReady()) {
      await redisClient.setEx(key, 60 * 15, JSON.stringify(data)); // 15 min
    }

    res.json(data);
  } catch (err) {
    console.error('Monthly analytics error:', err);
    res.status(500).json({ message: 'Server error while fetching monthly analytics' });
  }
}

// 2) Category-wise expense breakdown – cache 1 hour
export async function getCategoryBreakdown(req, res) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const key = `analytics:category:${userKeyPart(req)}:year:${year}`;

    if (isRedisReady()) {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const params = [year];
    let where = `WHERE t.type = 'expense' AND EXTRACT(YEAR FROM t.transaction_date) = $1`;

    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      where += ' AND t.user_id = $2';
    }

    const query = `
      SELECT
        COALESCE(c.name, 'Uncategorized') AS category,
        SUM(t.amount) AS total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ${where}
      GROUP BY category
      ORDER BY total DESC;
    `;

    const result = await pool.query(query, params);

    const data = result.rows.map((row) => ({
      category: row.category,
      total: Number(row.total || 0),
    }));

    if (isRedisReady()) {
      await redisClient.setEx(key, 60 * 60, JSON.stringify(data)); // 1 hr
    }

    res.json(data);
  } catch (err) {
    console.error('Category analytics error:', err);
    res.status(500).json({ message: 'Server error while fetching category breakdown' });
  }
}

// 3) Income vs Expense – cache 15 min
export async function getIncomeVsExpense(req, res) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const key = `analytics:income-expense:${userKeyPart(req)}:year:${year}`;

    if (isRedisReady()) {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const params = [year];
    let where = 'WHERE EXTRACT(YEAR FROM transaction_date) = $1';

    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      where += ' AND user_id = $2';
    }

    const query = `
      SELECT
        DATE_TRUNC('month', transaction_date) AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
      FROM transactions
      ${where}
      GROUP BY month
      ORDER BY month;
    `;

    const result = await pool.query(query, params);

    const data = result.rows.map((row) => ({
      month: row.month,
      income: Number(row.income || 0),
      expense: Number(row.expense || 0),
    }));

    if (isRedisReady()) {
      await redisClient.setEx(key, 60 * 15, JSON.stringify(data)); // 15 min
    }

    res.json(data);
  } catch (err) {
    console.error('Income vs expense analytics error:', err);
    res.status(500).json({ message: 'Server error while fetching income vs expense' });
  }
}
