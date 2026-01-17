# Supabase Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the root of your project with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ntneiwqcqpehehjepzcx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_vHGC0SNFZwe-qVyPjLPWng_A67AlWsQ
```

## 2. Database Schema Setup

**IMPORTANT: You must create the tasks table before the app will work!**

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ntneiwqcqpehehjepzcx
2. Navigate to the **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Copy and paste the entire contents of `supabase-schema.sql` 
5. Click **"Run"** to execute the SQL
6. You should see a success message confirming the table was created

Alternatively, you can use the Supabase Table Editor:
- Go to Table Editor
- Click "New Table"
- Name it `tasks`
- Add the following columns:
  - `id` (uuid, primary key, default: gen_random_uuid())
  - `title` (text, not null)
  - `status` (text, not null) - with check constraint: IN ('backlog', 'todo', 'in progress', 'done', 'canceled')
  - `priority` (text, not null) - with check constraint: IN ('low', 'medium', 'high')
  - `created_at` (timestamptz, default: now())
  - `updated_at` (timestamptz, default: now())

## 3. Row Level Security (RLS)

The schema includes RLS policies. Make sure to:
1. Enable RLS on the tasks table
2. Create a policy that allows public access (or authenticated users only, based on your needs)

## 4. Test the Connection

After setting up:
1. Restart your Next.js dev server
2. The tasks should now load from Supabase
3. You can add, update, and delete tasks through the UI

## 5. Optional: Seed Initial Data

To add sample tasks to test the application:

1. Go to the SQL Editor in your Supabase dashboard
2. Run the SQL script from `supabase-seed-data.sql`
3. This will insert 25 sample tasks with various statuses and priorities

Alternatively, you can add tasks directly through the UI once the table is set up!
