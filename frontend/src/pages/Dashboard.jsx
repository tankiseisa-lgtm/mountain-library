import { useEffect, useState } from 'react';

const API = 'http://localhost:5000';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setMessage('');

    try {
      const responses = await Promise.all([
        fetch(`${API}/books`),
        fetch(`${API}/users`),
        fetch(`${API}/transactions`)
      ]);

      const data = await Promise.all(responses.map(response => response.json()));
      const [bookData, userData, transactionData] = data;

      if (!responses[0].ok) throw new Error(bookData.message || 'Could not load books');
      if (!responses[1].ok) throw new Error(userData.message || 'Could not load users');
      if (!responses[2].ok) throw new Error(transactionData.message || 'Could not load transactions');

      setBooks(Array.isArray(bookData) ? bookData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
    } catch (error) {
      setMessage(error.message || 'Could not load dashboard information. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalTitles = books.length;
  const availableCopies = books.reduce((sum, book) => sum + Number(book.quantity || 0), 0);
  const totalMembers = users.filter(
    user => String(user.role || '').trim().toLowerCase() === 'member'
  ).length;
  const borrowedCopiesRecorded = transactions
    .filter(transaction => String(transaction.type).toUpperCase() === 'BORROW')
    .reduce((sum, transaction) => sum + Number(transaction.quantity || 0), 0);
  const lowStockBooks = books.filter(book => Number(book.quantity || 0) <= 2);
  const recentTransactions = transactions.slice(0, 5);

  function getStockStatus(quantity) {
    const count = Number(quantity || 0);
    if (count === 0) return 'Out of stock';
    if (count <= 2) return 'Low stock';
    return 'Available';
  }

  return (
    <section className="dashboard">
      <div className="dashboard-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of Mountain Library</p>
        </div>
        <button type="button" onClick={loadDashboard} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Dashboard'}
        </button>
      </div>

      {message && <p role="alert" className="dashboard-error">{message}</p>}

      {loading ? (
        <p>Loading library information...</p>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Book Titles</h3>
              <p>{totalTitles}</p>
            </div>
            <div className="stat-card">
              <h3>Available Copies</h3>
              <p>{availableCopies}</p>
            </div>
            <div className="stat-card">
              <h3>Registered Members</h3>
              <p>{totalMembers}</p>
            </div>
            <div className="stat-card">
              <h3>Low Stock Titles</h3>
              <p>{lowStockBooks.length}</p>
            </div>
            <div className="stat-card">
              <h3>Copies Borrowed (Recorded)</h3>
              <p>{borrowedCopiesRecorded}</p>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h3>Book Availability</h3>
                <p>Current stock for every book in the library</p>
              </div>
              <span className="stock-note">Low stock: 2 copies or fewer</span>
            </div>

            {books.length === 0 ? (
              <p>No books have been added to the library yet.</p>
            ) : (
              <div className="dashboard-table-wrap">
                <table className="availability-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Genre</th>
                      <th>ISBN</th>
                      <th>Available Copies</th>
                      <th>Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => {
                      const quantity = Number(book.quantity || 0);
                      const lowStock = quantity <= 2;
                      return (
                        <tr key={book.id} className={lowStock ? 'low-stock-row' : ''}>
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td>{book.genre || '—'}</td>
                          <td>{book.isbn || '—'}</td>
                          <td><strong>{quantity}</strong></td>
                          <td>
                            <span className={`stock-status ${quantity === 0 ? 'out-of-stock' : lowStock ? 'low' : 'available'}`}>
                              {getStockStatus(quantity)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <h3>Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <p>No transactions have been recorded yet.</p>
            ) : (
              <div className="dashboard-table-wrap">
                <table>
                  <thead>
                    <tr><th>Book</th><th>Member</th><th>Type</th><th>Quantity</th></tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>{transaction.book_title || 'Unknown book'}</td>
                        <td>{transaction.user_name || 'Not specified'}</td>
                        <td>{transaction.type}</td>
                        <td>{transaction.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
