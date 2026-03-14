const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM labels WHERE is_private = false OR created_by = $1 ORDER BY name ASC', [req.user.id]);
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, color, is_private } = req.body;
  const result = await query('INSERT INTO labels (name, color, is_private, created_by) VALUES ($1, $2, $3, $4) RETURNING *', [name, color || '#3b82f6', is_private || false, req.user.id]);
  res.json(result.rows[0]);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color, is_private } = req.body;
  const result = await query('UPDATE labels SET name = COALESCE($1, name), color = COALESCE($2, color), is_private = COALESCE($3, is_private) WHERE id = $4 AND created_by = $5 RETURNING *', [name, color, is_private, id, req.user.id]);
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM labels WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
  res.json({ message: 'Label deleted' });
});

module.exports = router;
