import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, membership_id, role FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Could not retrieve users', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, membership_id, role } = req.body;
  if (!name || !membership_id || !role) {
    return res.status(400).json({ message: 'Name, membership ID and role are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, role) VALUES (?, ?, ?)',
      [name, membership_id, role]
    );
    res.status(201).json({ id: result.insertId, message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not add user', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, membership_id, role } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE users SET name=?, membership_id=?, role=? WHERE id=?',
      [name, membership_id, role, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not update user', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { name, membership_id } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT id, name, membership_id, role FROM users WHERE name=? AND membership_id=?',
      [name, membership_id]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid login details' });
    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router;
