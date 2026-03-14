const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM shops ORDER BY name ASC');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, color } = req.body;
  const result = await query('INSERT INTO shops (name, color, created_by) VALUES ($1, $2, $3) RETURNING *', [name, color || '#3b82f6', req.user.id]);
  res.json(result.rows[0]);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  const result = await query('UPDATE shops SET name = COALESCE($1, name), color = COALESCE($2, color) WHERE id = $3 RETURNING *', [name, color, id]);
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM shops WHERE id = $1', [req.params.id]);
  res.json({ message: 'Shop deleted' });
});

module.exports = router;
