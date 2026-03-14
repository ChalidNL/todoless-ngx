const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'todoless',
  user: process.env.DB_USER || 'todoless',
  password: process.env.DB_PASSWORD || 'todoless',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn('Slow query:', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

const initialize = async () => {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        used_by UUID REFERENCES users(id) ON DELETE SET NULL,
        used_at TIMESTAMP,
        expires_at TIMESTAMP,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS labels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) DEFAULT '#3b82f6',
        is_private BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(name, created_by)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) DEFAULT '#3b82f6',
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sprints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        duration VARCHAR(50) DEFAULT 'week',
        is_active BOOLEAN DEFAULT true,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'backlog',
        priority VARCHAR(50) DEFAULT 'normal',
        horizon VARCHAR(50),
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
        parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        due_date TIMESTAMP,
        blocked BOOLEAN DEFAULT false,
        block_reason TEXT,
        estimated_hours DECIMAL(10,2),
        actual_hours DECIMAL(10,2),
        completed_at TIMESTAMP,
        archived_at TIMESTAMP,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_labels (
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, label_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        quantity INTEGER DEFAULT 1,
        shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'normal',
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        archived_at TIMESTAMP,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS item_labels (
        item_id UUID REFERENCES items(id) ON DELETE CASCADE,
        label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, label_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT,
        pinned BOOLEAN DEFAULT false,
        archived BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS note_labels (
        note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
        label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (note_id, label_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        all_day BOOLEAN DEFAULT false,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        language VARCHAR(10) DEFAULT 'en',
        archive_retention_days INTEGER DEFAULT 30,
        auto_cleanup_enabled BOOLEAN DEFAULT true,
        theme VARCHAR(50) DEFAULT 'light',
        settings_json JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_items_created_by ON items(created_by);
      CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
      CREATE INDEX IF NOT EXISTS idx_labels_created_by ON labels(created_by);
      CREATE INDEX IF NOT EXISTS idx_notes_created_by ON notes(created_by);
      CREATE INDEX IF NOT EXISTS idx_calendar_start_time ON calendar_events(start_time);
    `);

    // Create trigger for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    const tables = ['tasks', 'items', 'notes', 'calendar_events', 'users', 'app_settings'];
    for (const table of tables) {
      await pool.query(`
        DROP TRIGGER IF EXISTS trigger_${table}_updated_at ON ${table};
        CREATE TRIGGER trigger_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
      `);
    }

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Real-time notification setup (for future WebSocket integration)
const setupNotifications = async () => {
  const client = await pool.connect();
  
  await client.query(`
    CREATE OR REPLACE FUNCTION notify_data_change()
    RETURNS TRIGGER AS $$
    DECLARE
      payload JSON;
    BEGIN
      payload = json_build_object(
        'table', TG_TABLE_NAME,
        'action', TG_OP,
        'id', COALESCE(NEW.id, OLD.id),
        'data', row_to_json(NEW)
      );
      PERFORM pg_notify('data_change', payload::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  const tables = ['tasks', 'items', 'notes', 'labels', 'sprints', 'calendar_events'];
  for (const table of tables) {
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_${table}_notify ON ${table};
      CREATE TRIGGER trigger_${table}_notify
      AFTER INSERT OR UPDATE OR DELETE ON ${table}
      FOR EACH ROW
      EXECUTE FUNCTION notify_data_change();
    `);
  }

  client.release();
  console.log('✅ Real-time notifications enabled');
};

module.exports = { pool, query, initialize, setupNotifications };
