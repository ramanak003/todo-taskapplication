-- Quick fix: Add missing columns to existing tasks table
-- Run this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ntneiwqcqpehehjepzcx/sql

-- Add missing columns
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS reminder TIMESTAMP WITH TIME ZONE;

-- Verify the columns were added successfully
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Success message
SELECT 'All columns added successfully! ✅' as status;
