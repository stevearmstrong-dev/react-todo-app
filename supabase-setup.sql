-- Supabase Database Setup for ToDo App
-- This file contains the complete database schema and configuration

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id bigint PRIMARY KEY,
  user_email text NOT NULL,
  text text NOT NULL,
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium',
  due_date text,
  due_time text,
  category text,
  reminder_minutes integer,
  calendar_event_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_email for faster queries
CREATE INDEX IF NOT EXISTS tasks_user_email_idx ON tasks(user_email);

-- Disable Row Level Security
-- RLS is disabled because this app uses simple email-based identification
-- without Supabase Auth. All data isolation is handled in the application code
-- by filtering tasks based on the user's email address.
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Note: If you previously had RLS policies, they can be removed:
-- DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
-- DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
-- DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
-- DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
