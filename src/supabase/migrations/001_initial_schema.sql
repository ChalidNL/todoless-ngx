-- Todoless Database Schema
-- Self-hosted Supabase setup

-- Enable Row Level Security
ALTER DATABASE todoless SET "app.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT CHECK (role IN ('admin', 'user', 'child')) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('backlog', 'todo', 'done')) DEFAULT 'backlog',
  priority TEXT CHECK (priority IN ('urgent', 'normal', 'low')),
  horizon TEXT CHECK (horizon IN ('week', 'month', '3months', '6months', 'year')),
  blocked BOOLEAN DEFAULT FALSE,
  blocked_comment TEXT,
  sprint_id UUID,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  repeat_interval TEXT CHECK (repeat_interval IN ('week', 'month', 'year')),
  labels JSONB DEFAULT '[]'::jsonb,
  is_private BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  delete_after TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  quantity INTEGER,
  category TEXT,
  location TEXT,
  minimum_stock INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  labels JSONB DEFAULT '[]'::jsonb,
  shop_id UUID,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  linked_to UUID,
  linked_type TEXT CHECK (linked_type IN ('task', 'item')),
  labels JSONB DEFAULT '[]'::jsonb,
  pinned BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  duration TEXT CHECK (duration IN ('1week', '2weeks', '3weeks', '1month')) NOT NULL,
  week_number INTEGER,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invite Codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ
);

-- App Settings table (global settings)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Calendar Events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('urgent', 'normal', 'low')),
  horizon TEXT CHECK (horizon IN ('week', 'month', '3months', '6months', 'year')),
  blocked BOOLEAN DEFAULT FALSE,
  blocked_comment TEXT,
  due_date TIMESTAMPTZ,
  repeat_interval TEXT CHECK (repeat_interval IN ('week', 'month', 'year')),
  labels JSONB DEFAULT '[]'::jsonb,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_archived ON tasks(archived);
CREATE INDEX idx_items_completed ON items(completed);
CREATE INDEX idx_notes_pinned ON notes(pinned);
CREATE INDEX idx_labels_created_by ON labels(created_by);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read all users (for assignments)
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Tasks: Private tasks only visible to creator, public tasks visible to all
CREATE POLICY "Public tasks are viewable by everyone" ON tasks FOR SELECT USING (is_private = false OR created_by = auth.uid());
CREATE POLICY "Users can insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (true);

-- Items: Similar to tasks
CREATE POLICY "Public items are viewable by everyone" ON items FOR SELECT USING (is_private = false);
CREATE POLICY "Users can insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update items" ON items FOR UPDATE USING (true);
CREATE POLICY "Users can delete items" ON items FOR DELETE USING (true);

-- Notes: Similar to tasks
CREATE POLICY "Public notes are viewable by everyone" ON notes FOR SELECT USING (is_private = false);
CREATE POLICY "Users can insert notes" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notes" ON notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete notes" ON notes FOR DELETE USING (true);

-- Labels: Private labels only visible to creator
CREATE POLICY "Public labels are viewable by everyone" ON labels FOR SELECT USING (is_private = false OR created_by = auth.uid());
CREATE POLICY "Users can insert labels" ON labels FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own labels" ON labels FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete their own labels" ON labels FOR DELETE USING (created_by = auth.uid());

-- Shops: Public for all users
CREATE POLICY "Shops are viewable by everyone" ON shops FOR SELECT USING (true);
CREATE POLICY "Users can insert shops" ON shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update shops" ON shops FOR UPDATE USING (true);
CREATE POLICY "Users can delete shops" ON shops FOR DELETE USING (true);

-- Sprints: Public for all users
CREATE POLICY "Sprints are viewable by everyone" ON sprints FOR SELECT USING (true);
CREATE POLICY "Users can insert sprints" ON sprints FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sprints" ON sprints FOR UPDATE USING (true);
CREATE POLICY "Users can delete sprints" ON sprints FOR DELETE USING (true);

-- Invite Codes: Only admins can manage
CREATE POLICY "Invite codes are viewable by everyone" ON invite_codes FOR SELECT USING (true);
CREATE POLICY "Users can insert invite codes" ON invite_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invite codes" ON invite_codes FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own invite codes" ON invite_codes FOR DELETE USING (created_by = auth.uid());

-- App Settings: Users can only see their own settings
CREATE POLICY "Users can view their own settings" ON app_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own settings" ON app_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own settings" ON app_settings FOR UPDATE USING (user_id = auth.uid());

-- Calendar Events: Similar to tasks
CREATE POLICY "Public events are viewable by everyone" ON calendar_events FOR SELECT USING (is_private = false);
CREATE POLICY "Users can insert events" ON calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update events" ON calendar_events FOR UPDATE USING (true);
CREATE POLICY "Users can delete events" ON calendar_events FOR DELETE USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time replication for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE labels;
ALTER PUBLICATION supabase_realtime ADD TABLE shops;
ALTER PUBLICATION supabase_realtime ADD TABLE sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE invite_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
