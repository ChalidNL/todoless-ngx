const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM invite_codes WHERE created_by = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { expires_at, max_uses } = req.body;
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  const result = await query(`
    INSERT INTO invite_codes (code, created_by, expires_at, max_uses, current_uses)
    VALUES ($1, $2, $3, $4, 0)
    RETURNING *
  `, [code, req.user.id, expires_at, max_uses || 1]);

  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM invite_codes WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
  res.json({ message: 'Invite deleted' });
});

module.exports = router;
