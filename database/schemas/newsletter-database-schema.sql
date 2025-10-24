-- Garcia Builder - Newsletter & Lead Generation Database Schema

-- Leads table for general lead capture
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    goal TEXT,
    experience TEXT,
    availability TEXT,
    message TEXT,
    source TEXT DEFAULT 'Unknown',
    campaign TEXT DEFAULT 'default',
    type TEXT DEFAULT 'lead', -- lead, consultation, download
    status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, closed
    ip TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    conversion_value DECIMAL(10,2) DEFAULT 0.00,
    tags TEXT[], -- Array of tags for segmentation
    custom_fields JSONB DEFAULT '{}'::jsonb -- Flexible custom data
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    type TEXT DEFAULT 'newsletter',
    source TEXT DEFAULT 'Newsletter Form',
    status TEXT DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced
    preferences JSONB DEFAULT '{
        "tips": true,
        "workouts": true,
        "nutrition": true,
        "promotions": false
    }'::jsonb,
    confirmed BOOLEAN DEFAULT false,
    confirmation_token TEXT,
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tags TEXT[],
    last_email_opened_at TIMESTAMPTZ,
    email_open_count INTEGER DEFAULT 0,
    email_click_count INTEGER DEFAULT 0
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    campaign_type TEXT DEFAULT 'newsletter', -- newsletter, welcome, follow_up, promotional
    status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, paused
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    recipient_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Email sends tracking
CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    subscriber_id TEXT,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, complained
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    error_message TEXT,
    tracking_data JSONB DEFAULT '{}'::jsonb
);

-- Lead activities/interactions tracking
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- email_sent, email_opened, form_submitted, page_visited, etc.
    activity_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Analytics/conversion tracking
CREATE TABLE IF NOT EXISTS conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- lead_capture, newsletter_signup, consultation_request, etc.
    source TEXT NOT NULL, -- Hero Form, Exit Intent, etc.
    campaign TEXT DEFAULT 'default',
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    landing_page TEXT,
    conversion_value DECIMAL(10,2) DEFAULT 0.00,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_source ON newsletter_subscribers(source);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscribers(created_at);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_type ON email_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);

CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_email ON email_sends(email);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_source ON conversion_events(source);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Admins can view all leads" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can insert leads" ON leads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

CREATE POLICY "Anyone can insert leads (public forms)" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update leads" ON leads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

-- RLS Policies for newsletter subscribers
CREATE POLICY "Admins can view all subscribers" ON newsletter_subscribers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Subscribers can update their own preferences" ON newsletter_subscribers
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Admins can update all subscribers" ON newsletter_subscribers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

-- RLS Policies for email campaigns (admin only)
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

-- RLS Policies for email sends (admin only)
CREATE POLICY "Admins can view email sends" ON email_sends
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

-- RLS Policies for lead activities (admin only)
CREATE POLICY "Admins can manage lead activities" ON lead_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

-- RLS Policies for conversion events
CREATE POLICY "Anyone can insert conversion events" ON conversion_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view conversion events" ON conversion_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
CREATE OR REPLACE VIEW lead_conversion_stats AS
SELECT
    source,
    campaign,
    DATE(created_at) as date,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
    ROUND(
        (COUNT(CASE WHEN status = 'converted' THEN 1 END)::decimal / COUNT(*)) * 100,
        2
    ) as conversion_rate
FROM leads
GROUP BY source, campaign, DATE(created_at)
ORDER BY date DESC, total_leads DESC;

CREATE OR REPLACE VIEW newsletter_growth_stats AS
SELECT
    DATE(created_at) as date,
    source,
    COUNT(*) as new_subscribers,
    SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_subscribers
FROM newsletter_subscribers
WHERE status = 'subscribed'
GROUP BY DATE(created_at), source
ORDER BY date DESC;

CREATE OR REPLACE VIEW email_campaign_performance AS
SELECT
    c.id,
    c.name,
    c.subject,
    c.campaign_type,
    c.sent_at,
    c.recipient_count,
    c.opened_count,
    c.clicked_count,
    c.unsubscribed_count,
    c.bounced_count,
    CASE
        WHEN c.recipient_count > 0 THEN
            ROUND((c.opened_count::decimal / c.recipient_count) * 100, 2)
        ELSE 0
    END as open_rate,
    CASE
        WHEN c.opened_count > 0 THEN
            ROUND((c.clicked_count::decimal / c.opened_count) * 100, 2)
        ELSE 0
    END as click_rate
FROM email_campaigns c
WHERE c.status = 'sent'
ORDER BY c.sent_at DESC;

-- Sample data for testing (optional)
/*
INSERT INTO leads (id, email, name, goal, source, type) VALUES
('lead_sample_1', 'john@example.com', 'John Doe', 'Weight Loss', 'Hero Form', 'lead'),
('lead_sample_2', 'jane@example.com', 'Jane Smith', 'Muscle Gain', 'Exit Intent', 'download');

INSERT INTO newsletter_subscribers (id, email, name, source) VALUES
('sub_sample_1', 'subscriber1@example.com', 'Newsletter User 1', 'Homepage Newsletter'),
('sub_sample_2', 'subscriber2@example.com', 'Newsletter User 2', 'Footer Newsletter');
*/
