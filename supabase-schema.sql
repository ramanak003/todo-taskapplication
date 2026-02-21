-- MASTER SETUP SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. DROP OLD TABLES (Clean Start)
DROP TABLE IF EXISTS task_audit_logs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 2. CREATE PROJECTS TABLE
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  project_link TEXT,
  due_date DATE,
  team_assigned TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CREATE TASKS TABLE
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('backlog', 'todo', 'in progress', 'done', 'canceled')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  date DATE,
  deadline DATE,
  reminder TIMESTAMP WITH TIME ZONE,
  position INTEGER,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ENABLE SECURITY
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- 5. ADD SAMPLE DATA
INSERT INTO projects (name, description, color, icon) VALUES ('Personal', 'Example project', '#3b82f6', 'user');

INSERT INTO tasks (title, status, priority, position, project_id) 
SELECT 'Welcome to Ramana Tasks!', 'todo', 'high', 1, id FROM projects LIMIT 1;

-- 6. RELOAD SCHEMA CACHE (CRITICAL FIX)
NOTIFY pgrst, 'reload schema';
 