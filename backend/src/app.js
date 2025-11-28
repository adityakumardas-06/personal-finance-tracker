import express from 'express';
import cors from 'cors';
// baaki imports...

const app = express();

// ✅ sab origins allow – assignment ke liye theek
app.use(cors());

app.use(express.json());

// agar health route nahi hai to add kar lo:
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// baaki routes:
/// app.use('/api/auth', authRoutes);
/// app.use('/api/transactions', transactionRoutes);

export default app;