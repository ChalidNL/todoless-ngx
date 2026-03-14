-- Todoless Database Initialization
-- Light version - Simple schema for task management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema (required for GoTrue)
CREATE SCHEMA IF NOT EXISTS auth;

-- Users table (managed by GoTrue)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    email_confirmed_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    confirmation_token VARCHAR(255),
    confirmation_sent_at TIMESTAMPTZ,
    recovery_token VARCHAR(255),
    recovery_sent_at TIMESTAMPTZ,
    email_change_token_new VARCHAR(255),
    email_change VARCHAR(255),
    email_change_sent_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    phone VARCHAR(15) UNIQUE,
    phone_confirmed_at TIMESTAMPTZ,
    phone_change VARCHAR(15),
    phone_change_token VARCHAR(255),
    phone_change_sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    email_change_token_current VARCHAR(255),
    email_change_confirm_status SMALLINT DEFAULT 0,
    banned_until TIMESTAMPTZ,
    reauthentication_token VARCHAR(255),
    reauthentication_sent_at TIMESTAMPTZ,
    is_sso_user BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- Create public schema tables
CREATE SCHEMA IF NOT EXISTS public;

-- Users profile table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labels table
CREATE TABLE IF NOT EXISTS public.labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6',
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'inbox' CHECK (status IN ('inbox', 'todo', 'in_progress', 'done', 'archived')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    sprint_icon VARCHAR(50),
    position INTEGER DEFAULT 0,
    archived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task labels (many-to-many)
CREATE TABLE IF NOT EXISTS public.task_labels (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

-- Items table (sub-tasks/checklist)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    archive_retention INTEGER DEFAULT 30 CHECK (archive_retention IN (30, 60, 90, 0)),
    auto_cleanup BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON public.tasks(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_labels_private ON public.labels(is_private);
CREATE INDEX IF NOT EXISTS idx_items_task ON public.items(task_id);

-- Create JWT roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
END
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks assigned to them or created by them" ON public.tasks
    FOR SELECT USING (
        auth.uid() = assigned_to OR 
        auth.uid() = created_by
    );

CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for labels
CREATE POLICY "Users can view public labels and their own private labels" ON public.labels
    FOR SELECT USING (
        NOT is_private OR 
        auth.uid() = created_by
    );

CREATE POLICY "Users can create labels" ON public.labels
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own labels" ON public.labels
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own labels" ON public.labels
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for items
CREATE POLICY "Users can view items of their tasks" ON public.items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = items.task_id 
            AND (tasks.assigned_to = auth.uid() OR tasks.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can create items for their tasks" ON public.items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = task_id 
            AND tasks.created_by = auth.uid()
        )
    );

-- RLS Policies for notes
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for settings
CREATE POLICY "Users can view their own settings" ON public.settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-archive completed tasks
CREATE OR REPLACE FUNCTION auto_archive_completed_tasks()
RETURNS void AS $$
BEGIN
    UPDATE public.tasks
    SET status = 'archived', archived_at = NOW()
    WHERE status = 'done' 
    AND completed_at IS NOT NULL
    AND archived_at IS NULL
    AND completed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old archived tasks based on user settings
CREATE OR REPLACE FUNCTION cleanup_archived_tasks()
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT user_id, archive_retention 
        FROM public.settings 
        WHERE auto_cleanup = TRUE AND archive_retention > 0
    LOOP
        DELETE FROM public.tasks
        WHERE created_by = user_record.user_id
        AND status = 'archived'
        AND archived_at < NOW() - (user_record.archive_retention || ' days')::INTERVAL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmed_at)
VALUES (
    uuid_generate_v4(),
    'admin@todoless.local',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert corresponding public user profile
INSERT INTO public.users (id, email, display_name, role)
SELECT id, email, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'admin@todoless.local'
ON CONFLICT (id) DO NOTHING;

-- Insert default settings for admin
INSERT INTO public.settings (user_id, archive_retention, auto_cleanup, language)
SELECT id, 30, TRUE, 'en'
FROM auth.users
WHERE email = 'admin@todoless.local'
ON CONFLICT (user_id) DO NOTHING;

-- Insert some default labels
INSERT INTO public.labels (name, color, is_private, created_by)
SELECT 
    'Urgent', '#ef4444', FALSE, id FROM auth.users WHERE email = 'admin@todoless.local'
UNION ALL
SELECT 
    'Work', '#3b82f6', FALSE, id FROM auth.users WHERE email = 'admin@todoless.local'
UNION ALL
SELECT 
    'Personal', '#8b5cf6', FALSE, id FROM auth.users WHERE email = 'admin@todoless.local'
UNION ALL
SELECT 
    'Later', '#6b7280', FALSE, id FROM auth.users WHERE email = 'admin@todoless.local'
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Todoless database initialized successfully!';
    RAISE NOTICE 'Default login: admin@todoless.local / admin123';
    RAISE NOTICE 'PLEASE CHANGE THE DEFAULT PASSWORD!';
END
$$;
