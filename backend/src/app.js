import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { authRequired, requireRole } from './middleware/authMiddleware.js';

const app = express();

// ---- Rate Limits ----
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many auth requests, please try again later.' },
});

const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { message: 'Too many transaction requests, please try again later.' },
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: 'Too many analytics requests, please try again later.' },
});

// ---- Middleware ----
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(xss());
app.use(morgan('dev'));

// Health routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

// Auth (rate limited)
app.use('/api/auth', authLimiter, authRoutes);

// Transactions (rate limited)
app.use('/api/transactions', transactionLimiter, transactionRoutes);

// Analytics (rate limited)
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);

// Current user
app.get('/api/me', authRequired, (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

// Admin-only
app.get('/api/admin/secret', authRequired, requireRole(['admin']), (req, res) => {
  res.json({ message: 'You are admin. Secret route unlocked.' });
});

export default app;