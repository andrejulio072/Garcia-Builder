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
