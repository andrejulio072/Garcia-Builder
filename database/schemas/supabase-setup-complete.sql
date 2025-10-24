-- Garcia Builder - Supabase Setup SQL
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    birthday DATE,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'trainer', 'client')),
    body_metrics JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Trigger para updated_at
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 6. Trigger para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        COALESCE(new.raw_user_meta_data->>'role', 'client')
    );
    RETURN new;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(id);

-- 8. Comentários
COMMENT ON TABLE profiles IS 'User profiles with extended information';
COMMENT ON COLUMN profiles.body_metrics IS 'JSON with weight, height, etc.';
COMMENT ON COLUMN profiles.preferences IS 'JSON with user preferences';
