const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT n.*, 
        COALESCE(
          json_agg(DISTINCT nl.label_id) FILTER (WHERE nl.label_id IS NOT NULL),
          '[]'
        ) as labels
      FROM notes n
      LEFT JOIN note_labels nl ON n.id = nl.note_id
      WHERE n.created_by = $1
      GROUP BY n.id
      ORDER BY n.pinned DESC, n.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, pinned, labels } = req.body;
    const result = await query(`
      INSERT INTO notes (title, content, pinned, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, content || '', pinned || false, req.user.id]);

    const note = result.rows[0];

    if (labels?.length) {
      for (const labelId of labels) {
        await query('INSERT INTO note_labels (note_id, label_id) VALUES ($1, $2)', [note.id, labelId]);
      }
    }

    res.json({ ...note, labels: labels || [] });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key !== 'labels' && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length) {
      values.push(id);
      values.push(req.user.id);
      await query(`UPDATE notes SET ${fields.join(', ')} WHERE id = $${paramCount} AND created_by = $${paramCount + 1}`, values);
    }

    if (updates.labels !== undefined) {
      await query('DELETE FROM note_labels WHERE note_id = $1', [id]);
      if (updates.labels.length) {
        for (const labelId of updates.labels) {
          await query('INSERT INTO note_labels (note_id, label_id) VALUES ($1, $2)', [id, labelId]);
        }
      }
    }

    const result = await query('SELECT * FROM notes WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM notes WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
