const express = require('express');
const { query } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, 
        COALESCE(
          json_agg(DISTINCT il.label_id) FILTER (WHERE il.label_id IS NOT NULL),
          '[]'
        ) as labels
      FROM items i
      LEFT JOIN item_labels il ON i.id = il.item_id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, quantity, shop_id, labels } = req.body;
    const result = await query(`
      INSERT INTO items (title, quantity, shop_id, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, quantity || 1, shop_id, req.user.id]);

    const item = result.rows[0];

    if (labels?.length) {
      for (const labelId of labels) {
        await query('INSERT INTO item_labels (item_id, label_id) VALUES ($1, $2)', [item.id, labelId]);
      }
    }

    res.json({ ...item, labels: labels || [] });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
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
      await query(`UPDATE items SET ${fields.join(', ')} WHERE id = $${paramCount}`, values);
    }

    if (updates.labels !== undefined) {
      await query('DELETE FROM item_labels WHERE item_id = $1', [id]);
      if (updates.labels.length) {
        for (const labelId of updates.labels) {
          await query('INSERT INTO item_labels (item_id, label_id) VALUES ($1, $2)', [id, labelId]);
        }
      }
    }

    const result = await query('SELECT * FROM items WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
