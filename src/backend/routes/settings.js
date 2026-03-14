const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  let result = await query('SELECT * FROM app_settings WHERE user_id = $1', [req.user.id]);
  
  if (result.rows.length === 0) {
    await query('INSERT INTO app_settings (user_id) VALUES ($1)', [req.user.id]);
    result = await query('SELECT * FROM app_settings WHERE user_id = $1', [req.user.id]);
  }

  res.json(result.rows[0]);
});

router.patch('/', async (req, res) => {
  const updates = req.body;
  const fields = Object.keys(updates).filter(k => k !== 'user_id').map((k, i) => `${k} = $${i + 1}`);
  const values = Object.keys(updates).filter(k => k !== 'user_id').map(k => updates[k]);

  if (fields.length) {
    values.push(req.user.id);
    await query(`UPDATE app_settings SET ${fields.join(', ')} WHERE user_id = $${values.length}`, values);
  }

  res.json({ message: 'Settings updated' });
});

module.exports = router;
