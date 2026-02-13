-- REFRESH SUPABASE SCHEMA CACHE
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor)

NOTIFY pgrst, 'reload schema';

-- Verify tasks table is visible
SELECT * FROM tasks LIMIT 1;
