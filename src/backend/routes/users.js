const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const result = await query('SELECT id, email, name, role, avatar_url, created_at FROM users');
  res.json(result.rows);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, avatar_url } = req.body;

  if (id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const result = await query('UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url) WHERE id = $3 RETURNING id, email, name, role, avatar_url', [name, avatar_url, id]);
  res.json(result.rows[0]);
});

module.exports = router;
