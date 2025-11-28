// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

// 🔴 Pehle: const API_BASE = 'https://personal-finance-tracker-1nlk.onrender.com';
// 🟢 Ab Render backend ka URL:
//const API_BASE = 'https://personal-finance-tracker-1mlkr.onrender.com';
const API_BASE = 'https://personal-finance-tracker-1nlk.onrender.com';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com'); // convenience ke liye
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('HANDLE SUBMIT START', { email, password });

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('FETCH DONE, status =', res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.log('ERROR RESPONSE BODY =', errData);
        throw new Error(errData.message || 'Invalid email or password');
      }

      const data = await res.json();
      console.log('SUCCESS RESPONSE DATA =', data);

      if (!data.user || !data.token) {
        throw new Error('Invalid response structure from server');
      }

      // AuthContext me save + redirect
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('FRONTEND LOGIN ERROR =>', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
      console.log('HANDLE SUBMIT END');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          border: '1px solid #ddd',
          padding: '2rem',
          borderRadius: '8px',
          width: '320px',
          fontFamily: 'sans-serif',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Login</h2>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>

        {error && (
          <div
            style={{
              color: 'red',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
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
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
          Try also:
          <br />
          <strong>user@example.com / User@123</strong>
          <br />
          <strong>readonly@example.com / ReadOnly@123</strong>
        </p>
      </form>
    </div>
  );
}