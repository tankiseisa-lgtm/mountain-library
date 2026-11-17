import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, b.title AS book_title, u.name AS user_name
       FROM transactions t
       LEFT JOIN books b ON t.book_id = b.id
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Could not retrieve transactions', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { book_id, user_id, type, quantity } = req.body;
  const amount = Number(quantity);
  if (!book_id || !type || !Number.isInteger(amount) || amount < 1 || !['ADD', 'BORROW'].includes(type)) {
    return res.status(400).json({ message: 'Provide a book, a valid type (ADD or BORROW), and quantity above zero' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [books] = await connection.query('SELECT quantity FROM books WHERE id=? FOR UPDATE', [book_id]);
    if (!books.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Book not found' });
    }
    const current = Number(books[0].quantity);
    if (type === 'BORROW' && current < amount) {
      await connection.rollback();
      return res.status(400).json({ message: 'Not enough copies in stock' });
    }
    const updated = type === 'ADD' ? current + amount : current - amount;
    await connection.query('UPDATE books SET quantity=? WHERE id=?', [updated, book_id]);
    await connection.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, ?, ?, ?)',
      [book_id, user_id || null, type, amount]
    );
    await connection.commit();
    res.status(201).json({ message: 'Transaction recorded', new_quantity: updated });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Could not record transaction', error: error.message });
  } finally {
    connection.release();
  }
});

export default router;
