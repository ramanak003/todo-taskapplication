# 🔧 Quick Fix for Supabase Database

## Problem
The database is missing columns: `description`, `date`, `deadline`, `reminder`

## Solution
Run this SQL in your Supabase dashboard to add the missing columns:

### Step 1: Go to Supabase SQL Editor
1. Open: https://supabase.com/dashboard/project/ntneiwqcqpehehjepzcx/sql
2. Click "New Query"

### Step 2: Run This SQL

```sql
-- Add missing columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS reminder TIMESTAMP WITH TIME ZONE;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;
```

### Step 3: Restart Your Dev Server
After running the SQL, restart your Next.js dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ After This Fix

All features will work:
- ✅ Add tasks with description, dates, and reminders
- ✅ Edit task details
- ✅ Delete tasks
- ✅ Mark tasks complete
- ✅ Filter by date (Upcoming, My Day)
- ✅ Real-time updates across tabs

## Alternative: Run Full Schema

If you prefer to recreate the entire table with all columns, you can run the full schema from `supabase-schema.sql` file.

**Note:** This will drop and recreate the table, so you'll lose existing data!
