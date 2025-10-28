-- ==========================================
-- GARCIA BUILDER - COMPLETE SUPABASE SETUP
-- Execute no Supabase SQL Editor (SQL Editor → New Query → Paste → Run)
-- ==========================================

-- 1. Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- TABELA: profiles
-- Perfis de usuário com informações estendidas
-- ==========================================
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

-- RLS: Habilitar segurança de linha
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(id);

-- Comentários
COMMENT ON TABLE profiles IS 'User profiles with extended information';
COMMENT ON COLUMN profiles.body_metrics IS 'JSON with weight, height, etc.';
COMMENT ON COLUMN profiles.preferences IS 'JSON with user preferences';

-- ==========================================
-- TABELA: body_metrics
-- Métricas corporais do usuário (peso, altura, etc.)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight NUMERIC,
    height NUMERIC,
    body_fat NUMERIC,
    measurements JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    client_id TEXT, -- client-generated id to dedupe local sync
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS: Habilitar segurança
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário gerencia apenas suas próprias métricas
CREATE POLICY "body_metrics_select_own"
    ON public.body_metrics FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "body_metrics_insert_own"
    ON public.body_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "body_metrics_update_own"
    ON public.body_metrics FOR UPDATE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON public.body_metrics(user_id, date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_body_metrics_user_client
    ON public.body_metrics(user_id, client_id) WHERE client_id IS NOT NULL;

-- ==========================================
-- TABELA: leads
-- Captura e tracking de leads do site
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    goal TEXT,
    timeline TEXT,
    experience_level TEXT,
    budget_range TEXT,
    message TEXT,

    -- UTM Tracking para medir origem
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,

    -- Geolocation e device info
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    device_type TEXT,

    -- Lead scoring e status
    lead_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    source_page TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contacted_at TIMESTAMP WITH TIME ZONE,

    -- Conversion tracking
    converted_at TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(10,2),
    plan_selected TEXT
);

-- RLS: Habilitar segurança
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas: público pode inserir, apenas admin visualiza/atualiza
CREATE POLICY "Anyone can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can view leads" ON leads
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'andrejulio072@gmail.com',
            'admin@garciabuilder.fitness'
        )
    );

CREATE POLICY "Only admin can update leads" ON leads
    FOR UPDATE USING (
        auth.jwt() ->> 'email' IN (
            'andrejulio072@gmail.com',
            'admin@garciabuilder.fitness'
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);
CREATE INDEX IF NOT EXISTS leads_utm_source_idx ON leads(utm_source);
CREATE INDEX IF NOT EXISTS leads_utm_campaign_idx ON leads(utm_campaign);

-- ==========================================
-- TABELA: lead_events
-- Tracking de eventos/ações dos leads
-- ==========================================
CREATE TABLE IF NOT EXISTS public.lead_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'page_view', 'form_submit', 'email_open', 'click', etc
    event_data JSONB,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Habilitar segurança
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Políticas: público pode inserir, apenas admin visualiza
CREATE POLICY "Anyone can insert events" ON lead_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can view events" ON lead_events
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'andrejulio072@gmail.com',
            'admin@garciabuilder.fitness'
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS lead_events_lead_id_idx ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS lead_events_type_idx ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS lead_events_created_at_idx ON lead_events(created_at);

-- ==========================================
-- FUNÇÕES E TRIGGERS
-- ==========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger para profiles.updated_at
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para body_metrics.updated_at
CREATE TRIGGER on_body_metrics_updated
    BEFORE UPDATE ON public.body_metrics
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para leads.updated_at
CREATE TRIGGER on_leads_updated
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, full_name)
    VALUES (
        NEW.id,
        NEW.id,
        NEW.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO UPDATE
        SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
            updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;

-- Trigger para criar perfil ao criar usuário
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- VIEW: leads_dashboard
-- Dashboard consolidado de leads
-- ==========================================
CREATE OR REPLACE VIEW public.leads_dashboard AS
SELECT
    l.*,
    COUNT(le.id) AS total_events,
    COUNT(CASE WHEN le.event_type = 'page_view' THEN 1 END) AS page_views,
    COUNT(CASE WHEN le.event_type = 'email_open' THEN 1 END) AS email_opens,
    EXTRACT(DAYS FROM NOW() - l.created_at) AS days_since_signup
FROM leads l
LEFT JOIN lead_events le ON l.id = le.lead_id
GROUP BY l.id
ORDER BY l.created_at DESC;

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
-- ✅ Tabelas criadas:
--    - profiles (perfis de usuário)
--    - body_metrics (métricas corporais)
--    - leads (leads do site)
--    - lead_events (eventos de leads)
-- ✅ RLS habilitado em todas as tabelas
-- ✅ Triggers configurados para updated_at e auto-criação de perfil
-- ✅ Índices criados para performance
-- ✅ View leads_dashboard criada
-- ==========================================
