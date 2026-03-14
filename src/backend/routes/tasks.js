const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Get all tasks (with privacy filtering)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        t.*,
        COALESCE(
          json_agg(DISTINCT tl.label_id) FILTER (WHERE tl.label_id IS NOT NULL),
          '[]'
        ) as labels
      FROM tasks t
      LEFT JOIN task_labels tl ON t.id = tl.task_id
      LEFT JOIN labels l ON tl.label_id = l.id
      WHERE t.created_by = $1 
        OR t.assigned_to = $1
        OR NOT EXISTS (
          SELECT 1 FROM task_labels tl2
          JOIN labels l2 ON tl2.label_id = l2.id
          WHERE tl2.task_id = t.id AND l2.is_private = true AND l2.created_by != $1
        )
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, horizon, assigned_to, sprint_id, due_date, labels } = req.body;

    const result = await query(`
      INSERT INTO tasks (title, description, status, priority, horizon, assigned_to, sprint_id, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, description, status || 'backlog', priority || 'normal', horizon, assigned_to, sprint_id, due_date, req.user.id]);

    const task = result.rows[0];

    // Add labels
    if (labels && labels.length > 0) {
      for (const labelId of labels) {
        await query('INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)', [task.id, labelId]);
      }
    }

    res.json({ ...task, labels: labels || [] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check ownership
    const taskResult = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskResult.rows.length === 0 || taskResult.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build update query
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

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount}`, values);
    }

    // Update labels if provided
    if (updates.labels !== undefined) {
      await query('DELETE FROM task_labels WHERE task_id = $1', [id]);
      if (updates.labels.length > 0) {
        for (const labelId of updates.labels) {
          await query('INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)', [id, labelId]);
        }
      }
    }

    const updatedResult = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    const labelsResult = await query('SELECT label_id FROM task_labels WHERE task_id = $1', [id]);
    
    res.json({ 
      ...updatedResult.rows[0], 
      labels: labelsResult.rows.map(l => l.label_id) 
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const taskResult = await query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (taskResult.rows.length === 0 || taskResult.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
