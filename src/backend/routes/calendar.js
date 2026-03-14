const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM calendar_events ORDER BY start_time ASC');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { title, description, start_time, end_time, all_day, task_id } = req.body;
  const result = await query('INSERT INTO calendar_events (title, description, start_time, end_time, all_day, task_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, start_time, end_time, all_day || false, task_id, req.user.id]);
  res.json(result.rows[0]);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates).filter(k => k !== 'id').map((k, i) => `${k} = $${i + 1}`);
  const values = Object.keys(updates).filter(k => k !== 'id').map(k => updates[k]);
  if (fields.length) {
    values.push(id);
    const result = await query(`UPDATE calendar_events SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    res.json(result.rows[0]);
  } else {
    res.json({ id });
  }
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM calendar_events WHERE id = $1', [req.params.id]);
  res.json({ message: 'Event deleted' });
});

module.exports = router;
