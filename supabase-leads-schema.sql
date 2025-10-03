-- ==========================================
-- GARCIA BUILDER - LEADS DATABASE SCHEMA
-- Execute no Supabase SQL Editor
-- ==========================================

-- Tabela de leads para captura e tracking
CREATE TABLE IF NOT EXISTS leads (
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

-- Indexes para performance
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);
CREATE INDEX IF NOT EXISTS leads_utm_source_idx ON leads(utm_source);
CREATE INDEX IF NOT EXISTS leads_utm_campaign_idx ON leads(utm_campaign);

-- RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy para inserção de leads (público pode inserir)
CREATE POLICY "Anyone can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

-- Policy para visualização (apenas admin)
CREATE POLICY "Only admin can view leads" ON leads
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'andrejulio072@gmail.com',
            'admin@garciabuilder.fitness'
        )
    );

-- Policy para atualização (apenas admin)
CREATE POLICY "Only admin can update leads" ON leads
    FOR UPDATE USING (
        auth.jwt() ->> 'email' IN (
            'andrejulio072@gmail.com', 
            'admin@garciabuilder.fitness'
        )
    );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE
    ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela para tracking de eventos/ações
CREATE TABLE IF NOT EXISTS lead_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'page_view', 'form_submit', 'email_open', 'click', etc
    event_data JSONB,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para eventos
CREATE INDEX IF NOT EXISTS lead_events_lead_id_idx ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS lead_events_type_idx ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS lead_events_created_at_idx ON lead_events(created_at);

-- RLS para eventos
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events" ON lead_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can view events" ON lead_events
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'andrejulio072@gmail.com',
            'admin@garciabuilder.fitness'
        )
    );

-- View para dashboard de leads
CREATE OR REPLACE VIEW leads_dashboard AS
SELECT 
    l.*,
    COUNT(le.id) as total_events,
    COUNT(CASE WHEN le.event_type = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN le.event_type = 'email_open' THEN 1 END) as email_opens,
    EXTRACT(DAYS FROM NOW() - l.created_at) as days_since_signup
FROM leads l
LEFT JOIN lead_events le ON l.id = le.lead_id
GROUP BY l.id
ORDER BY l.created_at DESC;