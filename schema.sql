-- ═══════════════════════════════════════════════════════════════════
-- SUPABASE DATABASE SCHEMA FOR SOVEREIGN CURATOR / FINANCIAL MENTOR
-- Project ID: qjmhsdompiwgfhbhzxmj
-- Run these statements in Supabase SQL Editor (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Table for User Profiles & Login Info
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    salary NUMERIC,
    expenses NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for Storing Financial Analysis & Goals
CREATE TABLE IF NOT EXISTS public.financial_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    income NUMERIC NOT NULL,
    expenses NUMERIC NOT NULL,
    savings NUMERIC NOT NULL,
    savings_percent NUMERIC,
    financial_score INT,
    goal TEXT,
    goal_amount NUMERIC,
    sip_recommendation NUMERIC,
    ai_advice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Indices for Performance
CREATE INDEX IF NOT EXISTS idx_financial_analyses_email ON public.financial_analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 4. Enable Row Level Security (RLS) & Public access policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select to user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public update to user_profiles" ON public.user_profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to financial_analyses" ON public.financial_analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select to financial_analyses" ON public.financial_analyses FOR SELECT USING (true);
