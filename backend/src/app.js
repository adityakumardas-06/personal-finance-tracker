import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();

app.use(cors());   // <-- Yeh top par hona hi chahiye
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

export default app;