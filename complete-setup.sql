-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('backlog', 'todo', 'in progress', 'done', 'canceled')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  date DATE,
  deadline DATE,
  reminder TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS projects (
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

-- 3. Link tasks to projects
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- 4. Create task audit logs table
CREATE TABLE IF NOT EXISTS task_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
  previous_values JSONB,
  new_values JSONB,
  actor_name TEXT,
  actor_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Enable Row Level Security (RLS) - PUBLIC ACCESS FOR dev
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to task audit logs" ON task_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 6. Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert Sample Projects
INSERT INTO projects (name, description, color, icon) VALUES
  ('Personal', 'Personal tasks and goals', '#3b82f6', 'user'),
  ('Work', 'Work-related tasks and projects', '#8b5cf6', 'briefcase'),
  ('Home', 'Home maintenance and chores', '#10b981', 'home')
ON CONFLICT DO NOTHING;
