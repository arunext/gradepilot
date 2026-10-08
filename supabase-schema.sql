-- ==============================================================================
-- GradeCrow AI (gradecrow.com) - Supabase Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ofnvnkcwzxmbwavxdvtm/sql/new
-- ==============================================================================

-- 1. Marking Schemes & Question Keys Table
CREATE TABLE IF NOT EXISTS public.rubrics (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    exam_title TEXT,
    max_marks NUMERIC(5,2) DEFAULT 5.0,
    is_multi_question BOOLEAN DEFAULT false,
    questions JSONB,
    key_points JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user rubric queries
CREATE INDEX IF NOT EXISTS idx_rubrics_user_id ON public.rubrics(user_id);

-- Enable Row Level Security (RLS) for Rubrics
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see, create, update, and delete their own rubrics
CREATE POLICY "Users can manage their own rubrics"
    ON public.rubrics
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. Evaluated Gradebook Records Table (Scanned Exam Marksheet & Breakdown)
CREATE TABLE IF NOT EXISTS public.gradebook_records (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT,
    roll_no TEXT,
    subject TEXT,
    question TEXT,
    final_score NUMERIC(5,2) DEFAULT 0.0,
    ai_score NUMERIC(5,2) DEFAULT 0.0,
    max_marks NUMERIC(5,2) DEFAULT 5.0,
    is_overridden BOOLEAN DEFAULT false,
    professor_remarks TEXT,
    breakdown JSONB,
    timestamp TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast student marksheet lookups and exports
CREATE INDEX IF NOT EXISTS idx_gradebook_user_id ON public.gradebook_records(user_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_created_at ON public.gradebook_records(created_at DESC);

-- Enable Row Level Security (RLS) for Gradebook Records
ALTER TABLE public.gradebook_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see, create, update, and delete their own gradebook records
CREATE POLICY "Users can manage their own gradebook records"
    ON public.gradebook_records
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
