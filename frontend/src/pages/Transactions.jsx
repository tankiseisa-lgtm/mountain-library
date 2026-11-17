import { useEffect, useState } from 'react';

const API = 'http://localhost:5000';

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    book_id: '',
    user_id: '',
    type: 'ADD',
    quantity: ''
  });

  async function loadData() {
    try {
      const [bookResponse, userResponse, transactionResponse] =
        await Promise.all([
          fetch(`${API}/books`),
          fetch(`${API}/users`),
          fetch(`${API}/transactions`)
        ]);

      const [bookData, userData, transactionData] = await Promise.all([
        bookResponse.json(),
        userResponse.json(),
        transactionResponse.json()
      ]);

      if (!bookResponse.ok) throw new Error(bookData.message);
      if (!userResponse.ok) throw new Error(userData.message);
      if (!transactionResponse.ok) throw new Error(transactionData.message);

      setBooks(bookData);
      setUsers(userData);
      setTransactions(transactionData);
    } catch (error) {
      setMessage(error.message || 'Could not load transaction information');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${API}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          user_id: form.type === 'BORROW' ? form.user_id : null
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage(`${data.message}. New stock: ${data.new_quantity}`);
      setForm({
        book_id: '',
        user_id: '',
        type: 'ADD',
        quantity: ''
      });

      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section>
      <h2>Transactions</h2>

      {message && <p>{message}</p>}

      <h3>Record Transaction</h3>

      <form onSubmit={handleSubmit}>
        <label>Select Book</label>
        <select name="book_id" value={form.book_id} onChange={handleChange} required>
          <option value="">Choose a book</option>
          {books.map(book => (
            <option key={book.id} value={book.id}>
              {book.title} (Available: {book.quantity})
            </option>
          ))}
        </select>

        <label>Transaction Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="ADD">Add Stock</option>
          <option value="BORROW">Borrow Book</option>
        </select>

        {form.type === 'BORROW' && (
          <>
            <label>Select Member</label>
            <select name="user_id" value={form.user_id} onChange={handleChange} required>
              <option value="">Choose a member</option>
              {users
                .filter(user => String(user.role || '').trim().toLowerCase() === 'member')
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.membership_id})
                  </option>
                ))}
            </select>
          </>
        )}

        <label>Quantity</label>
        <input
          name="quantity"
          type="number"
          min="1"
          placeholder="Enter quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <button type="submit">Record Transaction</button>
      </form>

      <h3>Transaction History</h3>

      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>Member</th>
            <th>Type</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.book_title || 'Unknown book'}</td>
              <td>{transaction.user_name || 'Not specified'}</td>
              <td>{transaction.type}</td>
              <td>{transaction.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
