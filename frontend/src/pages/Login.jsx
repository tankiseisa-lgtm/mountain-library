import { useState } from 'react';

const API = 'http://localhost:5000';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ name: '', membership_id: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      onLogin(data.user);
    } catch (error) {
      setMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <h1>Mountain Library</h1>
        <p>Library Management System</p>
        <h2>Welcome Back</h2>
        <p>Sign in using your registered name and membership ID.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-name">Full Name</label>
          <input
            id="login-name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          <label htmlFor="login-membership">Membership ID</label>
          <input
            id="login-membership"
            name="membership_id"
            type="text"
            placeholder="Enter your membership ID"
            value={form.membership_id}
            onChange={handleChange}
            required
          />

          {message && <p className="login-error" role="alert">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-help">
          Not registered yet? Please contact the librarian.
        </p>
      </section>
    </main>
  );
}
