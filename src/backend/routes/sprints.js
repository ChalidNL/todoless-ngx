const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM sprints ORDER BY start_date DESC');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, start_date, end_date, duration } = req.body;
  const result = await query('INSERT INTO sprints (name, start_date, end_date, duration, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, start_date, end_date, duration || 'week', req.user.id]);
  res.json(result.rows[0]);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates).filter(k => k !== 'id').map((k, i) => `${k} = $${i + 1}`);
  const values = Object.keys(updates).filter(k => k !== 'id').map(k => updates[k]);
  if (fields.length) {
    values.push(id);
    const result = await query(`UPDATE sprints SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    res.json(result.rows[0]);
  } else {
    res.json({ id });
  }
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM sprints WHERE id = $1', [req.params.id]);
  res.json({ message: 'Sprint deleted' });
});

module.exports = router;
