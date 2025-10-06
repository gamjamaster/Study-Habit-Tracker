-- ===============================================
-- StudyFlow - Supabase Database Schema
-- This schema includes user authentication and data isolation
-- ===============================================
-- Execute this SQL in Supabase SQL Editor
-- Settings > SQL Editor > New Query

-- 1. Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 2. Habits table
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_frequency INTEGER DEFAULT 1,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 3. Study Sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 4. Habit Logs table
CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 5. Goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    target_value INTEGER NOT NULL,
    target_unit VARCHAR(20),
    period VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- Index Creation (Performance Optimization)
-- ===============================================

-- User ID based indexes (most important!)
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Date based indexes (for date-specific queries)
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(created_at);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);

-- ===============================================
-- Row Level Security (RLS) Configuration
-- ===============================================
-- Security settings to ensure users can only access their own data

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only CRUD their own data)
-- Delete existing policies and recreate if they exist

-- Subjects policy
DROP POLICY IF EXISTS "Users can manage own subjects" ON subjects;
CREATE POLICY "Users can manage own subjects" ON subjects
    FOR ALL USING (auth.uid()::text = user_id);

-- Habits policy
DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
CREATE POLICY "Users can manage own habits" ON habits
    FOR ALL USING (auth.uid()::text = user_id);

-- Study Sessions policy
DROP POLICY IF EXISTS "Users can manage own study_sessions" ON study_sessions;
CREATE POLICY "Users can manage own study_sessions" ON study_sessions
    FOR ALL USING (auth.uid()::text = user_id);

-- Habit Logs policy
DROP POLICY IF EXISTS "Users can manage own habit_logs" ON habit_logs;
CREATE POLICY "Users can manage own habit_logs" ON habit_logs
    FOR ALL USING (auth.uid()::text = user_id);

-- Goals policy
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
CREATE POLICY "Users can manage own goals" ON goals
    FOR ALL USING (auth.uid()::text = user_id);

-- ===============================================
-- Sample Data Insertion (For Testing - Optional)
-- ===============================================
-- Comment out this section if you want to test with real user data

-- Sample subject data
-- INSERT INTO subjects (name, color, user_id) VALUES
-- ('Mathematics', '#FF6B6B', 'sample-user-id'),
-- ('Physics', '#4ECDC4', 'sample-user-id'),
-- ('Chemistry', '#45B7D1', 'sample-user-id');

-- Sample habit data
-- INSERT INTO habits (name, description, target_frequency, color, user_id) VALUES
-- ('Daily Exercise', '30 minutes of exercise daily', 1, '#96CEB4', 'sample-user-id'),
-- ('Reading', 'Read for 1 hour daily', 1, '#FFEAA7', 'sample-user-id'),
-- ('Water Intake', 'Drink 8 glasses of water', 8, '#74B9FF', 'sample-user-id');

-- ===============================================
-- Schema Creation Complete!
-- ===============================================
-- Proceed to the next steps:
-- 1. Deploy backend on Render
-- 2. Deploy frontend on Vercel
-- 3. Test the complete connection