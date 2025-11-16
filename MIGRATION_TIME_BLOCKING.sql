-- Migration script for Time Blocking feature
-- Run this script in your Supabase SQL editor

-- Add time blocking columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS scheduled_duration INTEGER;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_start ON tasks(scheduled_start);

-- Comments for documentation
COMMENT ON COLUMN tasks.scheduled_start IS 'ISO timestamp for when the task is scheduled to start';
COMMENT ON COLUMN tasks.scheduled_duration IS 'Scheduled duration in minutes';
