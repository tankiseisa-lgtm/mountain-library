import { useEffect, useState } from 'react';

const API = 'http://localhost:5000';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    membership_id: '',
    role: 'member'
  });

  async function loadUsers() {
    try {
      const response = await fetch(`${API}/users`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not retrieve users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || 'Could not retrieve users');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        editingId ? `${API}/users/${editingId}` : `${API}/users`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save user');

      setMessage(data.message);
      setForm({ name: '', membership_id: '', role: 'member' });
      setEditingId(null);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || 'Could not save user');
    }
  }

  function editUser(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      membership_id: user.membership_id,
      role: user.role
    });
  }

  async function deleteUser(id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not delete user');

      setMessage(data.message);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || 'Could not delete user');
    }
  }

  return (
    <section>
      <h2>User Management</h2>
      {message && <p role="status">{message}</p>}

      <h3>{editingId ? 'Update User' : 'Register New Member'}</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="membership_id"
          placeholder="Membership ID"
          value={form.membership_id}
          onChange={handleChange}
          required
        />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="member">Member</option>
          <option value="librarian">Librarian</option>
        </select>

        <button type="submit">
          {editingId ? 'Update User' : 'Register Member'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: '', membership_id: '', role: 'member' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>Registered Users</h3>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.membership_id}</td>
              <td>{user.role}</td>
              <td>
                <button type="button" onClick={() => editUser(user)}>Edit</button>
                <button type="button" onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
