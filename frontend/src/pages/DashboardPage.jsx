import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function DashboardPage() {
  const { user, token, logout } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    description: "",
    transactionDate: "",
  });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load transactions from API"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role === "read-only") {
      setError("Read-only user cannot create transactions.");
      return;
    }

    if (!form.amount || !form.transactionDate || !form.type) {
      setError("Please fill amount, type and date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await axios.post(
        `${API_URL}/api/transactions`,
        {
          amount: Number(form.amount),
          type: form.type,
          description: form.description || "",
          transactionDate: form.transactionDate,
          categoryId: null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setForm({
        amount: "",
        type: "expense",
        description: "",
        transactionDate: "",
      });

      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = user?.role === "read-only";

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Dashboard</h1>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px" }}>
            Logged in as <b>{user?.email}</b> ({user?.role})
          </div>
          <button
            onClick={logout}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              background: "#e53e3e",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 12px",
            background: "#fed7d7",
            color: "#c53030",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Add Transaction</h3>
        {isReadOnly && (
          <div
            style={{
              marginBottom: "8px",
              fontSize: "13px",
              color: "#718096",
            }}
          >
            You are a <b>read-only</b> user. Creating transactions is disabled.
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
        >
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            disabled={isReadOnly || saving}
            style={{ flex: "1 0 120px", padding: "6px" }}
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            disabled={isReadOnly || saving}
            style={{ flex: "1 0 120px", padding: "6px" }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            type="date"
            name="transactionDate"
            value={form.transactionDate}
            onChange={handleChange}
            disabled={isReadOnly || saving}
            style={{ flex: "1 0 160px", padding: "6px" }}
          />
          <input
            type="text"
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            disabled={isReadOnly || saving}
            style={{ flex: "2 0 200px", padding: "6px" }}
          />
          <button
            type="submit"
            disabled={isReadOnly || saving}
            style={{
              padding: "6px 16px",
              background: isReadOnly ? "#a0aec0" : "#3182ce",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: isReadOnly ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      <div
        style={{
          padding: "16px",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Your Transactions</h3>
        {loading ? (
          <div>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ fontSize: "14px", color: "#718096" }}>
            No transactions yet.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #e2e8f0", padding: "6px" }}>
                  Date
                </th>
                <th style={{ borderBottom: "1px solid #e2e8f0", padding: "6px" }}>
                  Type
                </th>
                <th style={{ borderBottom: "1px solid #e2e8f0", padding: "6px" }}>
                  Amount
                </th>
                <th style={{ borderBottom: "1px solid #e2e8f0", padding: "6px" }}>
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ borderBottom: "1px solid #edf2f7", padding: "6px" }}>
                    {new Date(
                      t.transaction_date || t.transactionDate
                    ).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #edf2f7",
                      padding: "6px",
                      textTransform: "capitalize",
                    }}
                  >
                    {t.type}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #edf2f7",
                      padding: "6px",
                      color: t.type === "income" ? "#38a169" : "#e53e3e",
                    }}
                  >
                    ₹{t.amount}
                  </td>
                  <td style={{ borderBottom: "1px solid #edf2f7", padding: "6px" }}>
                    {t.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}