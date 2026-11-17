import { useEffect, useState } from 'react';

const API = 'http://localhost:5000';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', author: '', genre: '', isbn: '', quantity: ''
  });

  async function loadBooks() {
    try {
      const response = await fetch(`${API}/books`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setBooks(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        editingId ? `${API}/books/${editingId}` : `${API}/books`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, quantity: Number(form.quantity) })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage(data.message);
      setForm({ title: '', author: '', genre: '', isbn: '', quantity: '' });
      setEditingId(null);
      loadBooks();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editBook(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre || '',
      isbn: book.isbn || '',
      quantity: book.quantity
    });
  }

  async function deleteBook(id) {
    if (!window.confirm('Delete this book?')) return;

    try {
      const response = await fetch(`${API}/books/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage(data.message);
      loadBooks();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section>
      <h2>Book Management</h2>
      {message && <p>{message}</p>}

      <h3>{editingId ? 'Update Book' : 'Add New Book'}</h3>

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Book title" value={form.title} onChange={handleChange} required />
        <input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
        <input name="genre" placeholder="Genre" value={form.genre} onChange={handleChange} />
        <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={handleChange} />
        <input name="quantity" type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
        <button type="submit">{editingId ? 'Update Book' : 'Add Book'}</button>
        {editingId && <button type="button" onClick={() => {
          setEditingId(null);
          setForm({ title: '', author: '', genre: '', isbn: '', quantity: '' });
        }}>Cancel</button>}
      </form>

      <h3>Books List</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Author</th><th>Genre</th>
            <th>ISBN</th><th>Quantity</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.isbn}</td>
              <td>{book.quantity}</td>
              <td>
                <button type="button" onClick={() => editBook(book)}>Edit</button>
                <button type="button" onClick={() => deleteBook(book.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
