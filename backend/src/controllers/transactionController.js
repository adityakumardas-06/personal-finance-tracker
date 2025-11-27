import { pool } from '../db.js';

// CREATE transaction (admin + user)
export async function createTransaction(req, res) {
  try {
    const { amount, type, categoryId, description, transactionDate } = req.body;

    if (!amount || !type || !transactionDate) {
      return res.status(400).json({ message: 'amount, type, transactionDate required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'type must be income or expense' });
    }

    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, category_id, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, amount, type, categoryId || null, description || null, transactionDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Transaction Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET transactions (admin = all, user/read-only = own)
export async function getTransactions(req, res) {
  try {
    let { page = 1, limit = 10, type, categoryId } = req.query;
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    const params = [];
    let where = 'WHERE 1=1';

    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      where += ` AND user_id = $${params.length}`;
    }

    if (type) {
      params.push(type);
      where += ` AND type = $${params.length}`;
    }

    if (categoryId) {
      params.push(categoryId);
      where += ` AND category_id = $${params.length}`;
    }

    params.push(limit);
    params.push(offset);

    const query = `
      SELECT * FROM transactions
      ${where}
      ORDER BY transaction_date DESC
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get Transactions Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// UPDATE transaction (admin + user, but user only apna)
export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const txn = existing.rows[0];

    if (req.user.role !== 'admin' && txn.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { amount, type, categoryId, description, transactionDate } = req.body;

    const result = await pool.query(
      `UPDATE transactions
       SET amount = $1,
           type = $2,
           category_id = $3,
           description = $4,
           transaction_date = $5
       WHERE id = $6
       RETURNING *`,
      [
        amount || txn.amount,
        type || txn.type,
        categoryId || txn.category_id,
        description || txn.description,
        transactionDate || txn.transaction_date,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Transaction Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE transaction (admin + user, but user only apna)
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const txn = existing.rows[0];

    if (req.user.role !== 'admin' && txn.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete Transaction Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}