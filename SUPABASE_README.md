# Supabase Setup Guide

This document explains how to set up the Supabase database for the ToDo App.

## Quick Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase-setup.sql`
4. Copy your project URL and anon key to `src/services/supabase.js`

## Database Configuration

### Tasks Table Schema

The `tasks` table stores all user tasks with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key (timestamp-based) |
| `user_email` | text | User's email address for data isolation |
| `text` | text | Task description |
| `completed` | boolean | Task completion status |
| `priority` | text | Priority level (low, medium, high) |
| `due_date` | text | Due date in YYYY-MM-DD format |
| `due_time` | text | Due time in HH:MM format |
| `category` | text | Task category |
| `reminder_minutes` | integer | Minutes before due time to remind |
| `calendar_event_id` | text | Google Calendar event ID (if synced) |
| `created_at` | timestamp | Task creation timestamp |

### Row Level Security (RLS)

**RLS is DISABLED for this table.**

This app uses simple email-based user identification without Supabase Auth. Data isolation is handled entirely in the application code by filtering tasks based on the `user_email` field.

If RLS were enabled, it would require authenticated users (via `auth.jwt()`), which is not compatible with the simple email identification system used in this app.

### Security Model

- **Email-based isolation**: Tasks are filtered by `user_email` in all database queries
- **Client-side filtering**: The app only fetches and displays tasks matching the current user's email
- **No authentication**: Users simply provide an email address; there's no password or OAuth flow
- **Suitable for**: Personal use, demos, prototypes, non-sensitive data

## Environment Variables

Update the following values in `src/services/supabase.js`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

## Current Configuration

- **Project URL**: https://nylvcqjzczvfkjjbeoef.supabase.co
- **Database**: PostgreSQL
- **Region**: Auto-selected based on project creation
- **RLS**: Disabled

## Testing the Setup

1. Visit the deployed app: https://stevearmstrong-dev.github.io/react-todo-app
2. Enter an email address when prompted
3. Create a new task
4. Verify the task appears in Supabase Table Editor
5. Refresh the page and confirm the task persists
6. Open the app on another device/browser with the same email
7. Confirm tasks are synced across devices

## Troubleshooting

### Tasks not appearing in Supabase?
- Check browser console for errors
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Ensure RLS is disabled: `ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;`

### Tasks disappearing after refresh?
- Verify RLS is disabled (most common issue)
- Check that the correct email is being used
- Look for errors in browser console

### Can't query tasks in SQL Editor?
```sql
-- View all tasks
SELECT * FROM tasks;

-- View tasks for specific user
SELECT * FROM tasks WHERE user_email = 'your@email.com';

-- Count tasks per user
SELECT user_email, COUNT(*) FROM tasks GROUP BY user_email;
```
