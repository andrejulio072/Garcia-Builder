-- =============================================================
-- GARCIA BUILDER - AUTH LOGIN/REGISTER PATCH (SUPABASE)
-- Purpose:
-- 1) Ensure signup does not fail because of trigger/schema mismatch
-- 2) Ensure user_profiles exists for frontend upserts
-- 3) Keep profiles table in sync for existing admin/profile flows
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------------
-- 1) user_profiles table (expected by frontend auth/profile code)
-- -------------------------------------------------------------
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
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'user_profiles'
          AND policyname = 'User can select own user_profiles'
    ) THEN
        CREATE POLICY "User can select own user_profiles"
            ON public.user_profiles
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'user_profiles'
          AND policyname = 'User can insert own user_profiles'
    ) THEN
        CREATE POLICY "User can insert own user_profiles"
            ON public.user_profiles
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'user_profiles'
          AND policyname = 'User can update own user_profiles'
    ) THEN
        CREATE POLICY "User can update own user_profiles"
            ON public.user_profiles
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- -------------------------------------------------------------
-- 2) Normalize profiles table shape used by existing scripts
-- -------------------------------------------------------------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS birthday DATE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- -------------------------------------------------------------
-- 3) Fix trigger function to avoid invalid columns and keep both
--    profiles + user_profiles synchronized on new signup
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, birthday, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NULLIF(NEW.raw_user_meta_data->>'phone', ''),
        NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::date,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        birthday = COALESCE(EXCLUDED.birthday, public.profiles.birthday),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = timezone('utc', now());

    INSERT INTO public.user_profiles (user_id, email, full_name, phone, birthday, avatar_url, joined_date, last_login)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NULLIF(NEW.raw_user_meta_data->>'phone', ''),
        NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::date,
        NEW.raw_user_meta_data->>'avatar_url',
        timezone('utc', now()),
        timezone('utc', now())
    )
    ON CONFLICT (user_id) DO UPDATE
    SET email = COALESCE(EXCLUDED.email, public.user_profiles.email),
        full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
        birthday = COALESCE(EXCLUDED.birthday, public.user_profiles.birthday),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_profiles.avatar_url),
        updated_at = timezone('utc', now());

    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
          AND tgrelid = 'auth.users'::regclass
    ) THEN
        DROP TRIGGER on_auth_user_created ON auth.users;
    END IF;

    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE PROCEDURE public.handle_new_user();
END$$;

-- -------------------------------------------------------------
-- 4) Backfill current auth users into user_profiles (safe)
-- -------------------------------------------------------------
INSERT INTO public.user_profiles (user_id, email, full_name, joined_date, last_login)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.created_at, timezone('utc', now())),
    timezone('utc', now())
FROM auth.users au
ON CONFLICT (user_id) DO NOTHING;

-- -------------------------------------------------------------
-- 5) Quick checks (run after script)
-- -------------------------------------------------------------
-- select count(*) from auth.users;
-- select count(*) from public.user_profiles;
-- select id, full_name, phone, birthday from public.profiles limit 5;
