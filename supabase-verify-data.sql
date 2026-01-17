-- Verify that tasks were inserted successfully
-- Run this query to see all tasks in your database

SELECT 
  id,
  title,
  status,
  priority,
  created_at,
  updated_at
FROM tasks
ORDER BY created_at DESC;

-- Or get a count of tasks
SELECT COUNT(*) as total_tasks FROM tasks;
