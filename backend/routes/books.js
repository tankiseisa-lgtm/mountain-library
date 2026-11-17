import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Could not retrieve books', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  if (!title || !author || quantity === undefined) {
    return res.status(400).json({ message: 'Title, author and quantity are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title, author, genre || null, isbn || null, Number(quantity)]
    );
    res.status(201).json({ id: result.insertId, message: 'Book added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not add book', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
      [title, author, genre || null, isbn || null, Number(quantity), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not update book', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete book', error: error.message });
  }
});

export default router;
