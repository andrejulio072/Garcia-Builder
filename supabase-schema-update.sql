-- Garcia Builder - Schema Update for Social Login Enhancement
-- Execute este script no Supabase SQL Editor para adicionar campos extras ao perfil

-- 1. Add new fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 2. Update handle_new_user function trigger to include new fields
-- (If you have a custom trigger, you may need to adjust it)

-- 3. Create indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- 4. Column documentation comments
COMMENT ON COLUMN profiles.phone IS 'User phone number (international format recommended)';
COMMENT ON COLUMN profiles.date_of_birth IS 'User date of birth';

-- 5. RLS (Row Level Security) policies for new fields
-- Users can only view and edit their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for reading (SELECT) - if it doesn't exist yet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can view own profile'
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
END
$$;

-- Policy for updating (UPDATE) - if it doesn't exist yet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can update own profile'
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END
$$;

-- Final verification - show profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================================
-- Garcia Builder - Extended Trainerize-like Schema
-- The frontend expects the following tables. Run this section
-- to create them if they do not already exist.
-- ============================================================

-- user_profiles: stores basic information (separate from public.profiles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    birthday DATE,
    location TEXT,
    bio TEXT,
    goals JSONB DEFAULT '[]'::jsonb,
    experience_level TEXT,
    joined_date TIMESTAMPTZ DEFAULT now(),
    last_login TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'User can select own user_profiles' AND tablename = 'user_profiles'
    ) THEN
        CREATE POLICY "User can select own user_profiles" ON public.user_profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'User can upsert own user_profiles' AND tablename = 'user_profiles'
    ) THEN
        CREATE POLICY "User can upsert own user_profiles" ON public.user_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "User can update own user_profiles" ON public.user_profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END$$;

-- body_metrics: single-row per user storing latest metrics + histories in JSONB
CREATE TABLE IF NOT EXISTS public.body_metrics (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_weight NUMERIC,
    height NUMERIC,
    target_weight NUMERIC,
    body_fat_percentage NUMERIC,
    muscle_mass NUMERIC,
    measurements JSONB DEFAULT '{"chest": "", "waist": "", "hips": "", "arms": "", "thighs": ""}'::jsonb,
    progress_photos JSONB DEFAULT '[]'::jsonb,
    weight_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'User can select own body_metrics' AND tablename = 'body_metrics'
    ) THEN
        CREATE POLICY "User can select own body_metrics" ON public.body_metrics
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'User can upsert own body_metrics' AND tablename = 'body_metrics'
    ) THEN
        CREATE POLICY "User can upsert own body_metrics" ON public.body_metrics
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "User can update own body_metrics" ON public.body_metrics
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END$$;

-- user_preferences: per-user UI and privacy settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    units TEXT DEFAULT 'metric',
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'en',
    notifications JSONB DEFAULT '{"email": true, "push": true, "reminders": true}'::jsonb,
    privacy JSONB DEFAULT '{"profile_visible": true, "progress_visible": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'User can select own user_preferences' AND tablename = 'user_preferences'
    ) THEN
        CREATE POLICY "User can select own user_preferences" ON public.user_preferences
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'User can upsert own user_preferences' AND tablename = 'user_preferences'
    ) THEN
        CREATE POLICY "User can upsert own user_preferences" ON public.user_preferences
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "User can update own user_preferences" ON public.user_preferences
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone);

-- Storage note:
-- Create a public bucket named 'user-assets' in Storage for avatars and progress photos.
-- Consider adding a folder structure {user_id}/avatars and {user_id}/progress.
-- If you prefer signed URLs, disable 'Public bucket' and fetch signed URLs on the client instead.

-- ============================================================
-- Trainer/Coach capabilities
-- Adds trainer assignment and scheduling minimal tables + RLS
-- ============================================================

-- Add trainer assignment fields to user_profiles
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS trainer_name TEXT;

CREATE INDEX IF NOT EXISTS idx_user_profiles_trainer ON public.user_profiles(trainer_id);

-- Allow trainers to SELECT user_profiles for their assigned clients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Trainer can select assigned user_profiles' AND tablename = 'user_profiles'
    ) THEN
        CREATE POLICY "Trainer can select assigned user_profiles" ON public.user_profiles
            FOR SELECT USING (
                auth.uid() = trainer_id OR auth.uid() = user_id
            );
    END IF;
END$$;

-- Sessions: basic scheduling between trainer and client
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users and trainers can select own sessions' AND tablename = 'sessions'
    ) THEN
        CREATE POLICY "Users and trainers can select own sessions" ON public.sessions
            FOR SELECT USING (
                auth.uid() = user_id OR auth.uid() = trainer_id
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Trainer can insert sessions for their clients' AND tablename = 'sessions'
    ) THEN
        CREATE POLICY "Trainer can insert sessions for their clients" ON public.sessions
            FOR INSERT WITH CHECK (
                auth.uid() = trainer_id
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users or trainers can update own sessions' AND tablename = 'sessions'
    ) THEN
        CREATE POLICY "Users or trainers can update own sessions" ON public.sessions
            FOR UPDATE USING (
                auth.uid() = user_id OR auth.uid() = trainer_id
            );
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_sessions_trainer ON public.sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
