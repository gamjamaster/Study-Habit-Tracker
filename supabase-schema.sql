-- ===============================================
-- Study Habit Tracker - Supabase Database Schema
-- ===============================================
-- 이 SQL을 Supabase SQL Editor에서 실행하세요
-- Settings > SQL Editor > New Query에서 실행

-- 1. 과목 테이블 (Subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 2. 습관 테이블 (Habits)
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_frequency INTEGER DEFAULT 1,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 3. 학습 세션 테이블 (Study Sessions)
CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 4. 습관 로그 테이블 (Habit Logs)
CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT NOT NULL
);

-- 5. 목표 테이블 (Goals)
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
-- 인덱스 생성 (성능 최적화)
-- ===============================================

-- user_id 기준 인덱스 (가장 중요!)
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- 날짜 기준 인덱스 (날짜별 조회용)
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(created_at);

-- 외래키 인덱스
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);

-- ===============================================
-- Row Level Security (RLS) 설정
-- ===============================================
-- 사용자는 자신의 데이터만 접근할 수 있도록 보안 설정

-- RLS 활성화
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (사용자는 자신의 데이터만 CRUD 가능)
-- 기존 정책이 있으면 삭제하고 다시 생성

-- Subjects 정책
DROP POLICY IF EXISTS "Users can manage own subjects" ON subjects;
CREATE POLICY "Users can manage own subjects" ON subjects 
    FOR ALL USING (auth.uid()::text = user_id);

-- Habits 정책
DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
CREATE POLICY "Users can manage own habits" ON habits 
    FOR ALL USING (auth.uid()::text = user_id);

-- Study Sessions 정책
DROP POLICY IF EXISTS "Users can manage own study_sessions" ON study_sessions;
CREATE POLICY "Users can manage own study_sessions" ON study_sessions 
    FOR ALL USING (auth.uid()::text = user_id);

-- Habit Logs 정책
DROP POLICY IF EXISTS "Users can manage own habit_logs" ON habit_logs;
CREATE POLICY "Users can manage own habit_logs" ON habit_logs 
    FOR ALL USING (auth.uid()::text = user_id);

-- Goals 정책
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
CREATE POLICY "Users can manage own goals" ON goals 
    FOR ALL USING (auth.uid()::text = user_id);

-- ===============================================
-- 샘플 데이터 삽입 (테스트용 - 선택사항)
-- ===============================================
-- 실제 사용자 데이터로 테스트하려면 이 부분은 주석 처리하세요

-- 샘플 과목 데이터
-- INSERT INTO subjects (name, color, user_id) VALUES 
-- ('Mathematics', '#FF6B6B', 'sample-user-id'),
-- ('Physics', '#4ECDC4', 'sample-user-id'),
-- ('Chemistry', '#45B7D1', 'sample-user-id');

-- 샘플 습관 데이터
-- INSERT INTO habits (name, description, target_frequency, color, user_id) VALUES 
-- ('Daily Exercise', '30 minutes of exercise daily', 1, '#96CEB4', 'sample-user-id'),
-- ('Reading', 'Read for 1 hour daily', 1, '#FFEAA7', 'sample-user-id'),
-- ('Water Intake', 'Drink 8 glasses of water', 8, '#74B9FF', 'sample-user-id');

-- ===============================================
-- 스키마 생성 완료!
-- ===============================================
-- 이제 다음 단계로 진행하세요:
-- 1. Render에서 백엔드 배포
-- 2. Vercel에서 프론트엔드 배포
-- 3. 전체 연결 테스트