// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
const API_BASE = 'https://personal-finance-tracker-1mlkr.onrender.com';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' / 'expense'
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // --------- Load transactions on mount ----------
  useEffect(() => {
    if (!token) return;

    async function fetchTransactions() {
      setLoadingList(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('GET /api/transactions status =', res.status);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.log('ERROR BODY (GET) =>', errData);
          throw new Error(errData.message || 'Failed to load transactions');
        }

        const data = await res.json();
        console.log('GET /api/transactions data =', data);

        const list = Array.isArray(data.transactions)
          ? data.transactions
          : Array.isArray(data)
          ? data
          : [];

        setTransactions(list);
      } catch (err) {
        console.error('LOAD TRANSACTIONS ERROR =>', err);
        setError(err.message || 'Could not load transactions');
        setTransactions([]);
      } finally {
        setLoadingList(false);
      }
    }

    fetchTransactions();
  }, [token]);

  // --------- Add new transaction ----------
  async function handleAddTransaction(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        amount: Number(amount),
        type,
        transactionDate: date,          // 🔥 yahan fix: `date` -> `transactionDate`
        description: description || null,
      };

      console.log('POST /api/transactions payload =', payload);

      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('POST /api/transactions status =', res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.log('ERROR BODY (POST) =>', errData);
        throw new Error(errData.message || 'Failed to save transaction');
      }

      const data = await res.json();
      console.log('POST /api/transactions data =', data);

      const newTx =
        data.transaction || data.newTransaction || data.transactionCreated || data;

      if (Array.isArray(newTx)) {
        setTransactions(newTx);
      } else {
        setTransactions(prev => [newTx, ...prev]);
      }

      // form clear
      setAmount('');
      setDescription('');
      setType('expense');
      setDate('');
    } catch (err) {
      console.error('ADD TRANSACTION ERROR =>', err);
      setError(err.message || 'Could not save transaction');
    } finally {
      setSaving(false);
    }
  }

  // --------- UI ----------
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        fontFamily: 'sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem', fontSize: '0.9rem' }}>
            Logged in as {user?.email} ({user?.role})
          </span>
          <button
            onClick={logout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      <main style={{ display: 'flex', gap: '2rem' }}>
        {/* Left: Transactions list */}
        <section style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Your Transactions</h2>
          {loadingList ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      padding: '0.5rem',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      padding: '0.5rem',
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      borderBottom: '1px solid #ddd',
                      padding: '0.5rem',
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      padding: '0.5rem',
                    }}
                  >
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr
                    key={
                      tx.id ||
                      `${tx.transactionDate}-${tx.amount}-${tx.type}`
                    }
                  >
                    <td
                      style={{
                        borderBottom: '1px solid #f1f1f1',
                        padding: '0.5rem',
                      }}
                    >
                      {tx.transactionDate?.slice(0, 10) || ''}
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #f1f1f1',
                        padding: '0.5rem',
                      }}
                    >
                      {tx.type}
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #f1f1f1',
                        padding: '0.5rem',
                        textAlign: 'right',
                      }}
                    >
                      {tx.amount}
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #f1f1f1',
                        padding: '0.5rem',
                      }}
                    >
                      {tx.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Right: Add Transaction form */}
        <section style={{ width: '320px' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Add Transaction</h2>
          <form onSubmit={handleAddTransaction}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Amount
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                }}
                required
              />
            </label>

            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Type
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Date
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                }}
                required
              />
            </label>

            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Description (Optional)
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                }}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}