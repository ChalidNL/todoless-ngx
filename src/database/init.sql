-- Todoless-ngx Database Schema
-- Self-hosted Supabase PostgreSQL initialization

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'done', 'archived');
CREATE TYPE task_priority AS ENUM ('low', 'normal', 'urgent');
CREATE TYPE task_horizon AS ENUM ('today', 'week', 'month');
CREATE TYPE sprint_duration AS ENUM ('week', 'two_weeks', 'month');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invite codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labels table
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, created_by)
);

-- Shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprints table
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  duration sprint_duration DEFAULT 'week',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'backlog',
  priority task_priority DEFAULT 'normal',
  horizon task_horizon,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task labels (many-to-many)
CREATE TABLE IF NOT EXISTS public.task_labels (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- Items table (shopping/quantity items)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 1,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'normal',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item labels (many-to-many)
CREATE TABLE IF NOT EXISTS public.item_labels (
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, label_id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note labels (many-to-many)
CREATE TABLE IF NOT EXISTS public.note_labels (
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, label_id)
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App settings table (per user)
CREATE TABLE IF NOT EXISTS public.app_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en',
  archive_retention_days INT DEFAULT 30,
  auto_cleanup_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Filters table
CREATE TABLE IF NOT EXISTS public.filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  label_ids UUID[],
  status task_status[],
  priority task_priority[],
  horizon task_horizon[],
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------
-- ROW LEVEL SECURITY
-----------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filters ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Invite codes policies
CREATE POLICY "Anyone can view unused invite codes" ON public.invite_codes FOR SELECT USING (used_at IS NULL OR auth.uid() = created_by);
CREATE POLICY "Authenticated users can create invite codes" ON public.invite_codes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own invite codes" ON public.invite_codes FOR UPDATE USING (auth.uid() = created_by);

-- Labels policies (PRIVATE LABEL SUPPORT)
CREATE POLICY "Users can view public labels and own labels" ON public.labels 
  FOR SELECT USING (
    is_private = FALSE OR created_by = auth.uid()
  );
CREATE POLICY "Users can create own labels" ON public.labels FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own labels" ON public.labels FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own labels" ON public.labels FOR DELETE USING (auth.uid() = created_by);

-- Tasks policies (respects private labels)
CREATE POLICY "Users can view tasks without private labels or tasks with their labels" ON public.tasks
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM public.task_labels tl
      JOIN public.labels l ON l.id = tl.label_id
      WHERE tl.task_id = tasks.id
        AND l.is_private = TRUE
        AND l.created_by != auth.uid()
    )
  );
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = created_by);

-- Task labels policies
CREATE POLICY "Users can view task labels" ON public.task_labels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id)
);
CREATE POLICY "Users can add labels to own tasks" ON public.task_labels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND created_by = auth.uid())
);
CREATE POLICY "Users can remove labels from own tasks" ON public.task_labels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND created_by = auth.uid())
);

-- Items policies (respects private labels)
CREATE POLICY "Users can view items without private labels or items with their labels" ON public.items
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM public.item_labels il
      JOIN public.labels l ON l.id = il.label_id
      WHERE il.item_id = items.id
        AND l.is_private = TRUE
        AND l.created_by != auth.uid()
    )
  );
CREATE POLICY "Users can create items" ON public.items FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own items" ON public.items FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own items" ON public.items FOR DELETE USING (auth.uid() = created_by);

-- Item labels policies
CREATE POLICY "Users can view item labels" ON public.item_labels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.items WHERE id = item_id)
);
CREATE POLICY "Users can add labels to own items" ON public.item_labels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND created_by = auth.uid())
);
CREATE POLICY "Users can remove labels from own items" ON public.item_labels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND created_by = auth.uid())
);

-- Notes policies
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = created_by);

-- Note labels policies
CREATE POLICY "Users can view note labels" ON public.note_labels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND created_by = auth.uid())
);
CREATE POLICY "Users can add labels to own notes" ON public.note_labels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND created_by = auth.uid())
);
CREATE POLICY "Users can remove labels from own notes" ON public.note_labels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND created_by = auth.uid())
);

-- Calendar events policies
CREATE POLICY "Users can view all calendar events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Users can create calendar events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own calendar events" ON public.calendar_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own calendar events" ON public.calendar_events FOR DELETE USING (auth.uid() = created_by);

-- App settings policies
CREATE POLICY "Users can view own settings" ON public.app_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.app_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.app_settings FOR UPDATE USING (auth.uid() = user_id);

-- Shops policies
CREATE POLICY "Users can view all shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Users can create shops" ON public.shops FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own shops" ON public.shops FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own shops" ON public.shops FOR DELETE USING (auth.uid() = created_by);

-- Sprints policies
CREATE POLICY "Users can view all sprints" ON public.sprints FOR SELECT USING (true);
CREATE POLICY "Users can create sprints" ON public.sprints FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update sprints" ON public.sprints FOR UPDATE USING (true);
CREATE POLICY "Users can delete sprints" ON public.sprints FOR DELETE USING (auth.uid() = created_by);

-- Filters policies
CREATE POLICY "Users can view own filters" ON public.filters FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create filters" ON public.filters FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own filters" ON public.filters FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own filters" ON public.filters FOR DELETE USING (auth.uid() = created_by);

-----------------------
-- FUNCTIONS
-----------------------

-- Function to auto-archive completed tasks based on retention settings
CREATE OR REPLACE FUNCTION auto_archive_completed_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT user_id, archive_retention_days, auto_cleanup_enabled
    FROM public.app_settings
    WHERE auto_cleanup_enabled = TRUE
  LOOP
    -- Archive tasks
    UPDATE public.tasks
    SET status = 'archived', archived_at = NOW()
    WHERE created_by = user_record.user_id
      AND status = 'done'
      AND completed_at IS NOT NULL
      AND completed_at < NOW() - (user_record.archive_retention_days || ' days')::INTERVAL
      AND archived_at IS NULL;
    
    -- Archive items
    UPDATE public.items
    SET status = 'archived', archived_at = NOW()
    WHERE created_by = user_record.user_id
      AND status = 'done'
      AND completed_at IS NOT NULL
      AND completed_at < NOW() - (user_record.archive_retention_days || ' days')::INTERVAL
      AND archived_at IS NULL;
  END LOOP;
END;
$$;

-- Function to delete old archived tasks
CREATE OR REPLACE FUNCTION delete_old_archived_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT user_id, archive_retention_days, auto_cleanup_enabled
    FROM public.app_settings
    WHERE auto_cleanup_enabled = TRUE
      AND archive_retention_days > 0 -- Only delete if not unlimited
  LOOP
    -- Delete archived tasks
    DELETE FROM public.tasks
    WHERE created_by = user_record.user_id
      AND status = 'archived'
      AND archived_at IS NOT NULL
      AND archived_at < NOW() - (user_record.archive_retention_days || ' days')::INTERVAL;
    
    -- Delete archived items
    DELETE FROM public.items
    WHERE created_by = user_record.user_id
      AND status = 'archived'
      AND archived_at IS NOT NULL
      AND archived_at < NOW() - (user_record.archive_retention_days || ' days')::INTERVAL;
  END LOOP;
END;
$$;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  
  INSERT INTO public.app_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-----------------------
-- INDEXES
-----------------------

CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_sprint_id ON public.tasks(sprint_id);
CREATE INDEX idx_tasks_completed_at ON public.tasks(completed_at);
CREATE INDEX idx_tasks_archived_at ON public.tasks(archived_at);

CREATE INDEX idx_items_created_by ON public.items(created_by);
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_completed_at ON public.items(completed_at);
CREATE INDEX idx_items_archived_at ON public.items(archived_at);

CREATE INDEX idx_labels_created_by ON public.labels(created_by);
CREATE INDEX idx_labels_is_private ON public.labels(is_private);

CREATE INDEX idx_task_labels_task_id ON public.task_labels(task_id);
CREATE INDEX idx_task_labels_label_id ON public.task_labels(label_id);

CREATE INDEX idx_item_labels_item_id ON public.item_labels(item_id);
CREATE INDEX idx_item_labels_label_id ON public.item_labels(label_id);

-----------------------
-- GRANT PERMISSIONS
-----------------------

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create roles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END
$$;

-- Grant roles
GRANT anon, authenticated TO authenticator;
GRANT ALL ON SCHEMA public TO supabase_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_admin;
