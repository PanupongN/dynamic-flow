-- Dynamic Flow Database Schema
-- PostgreSQL Database Schema for Dynamic Flow Application
-- Updated for Azure PostgreSQL with Draft/Published versioning

-- Create database if not exists (run this manually in psql)
-- CREATE DATABASE dynamic_flow;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Flows table (metadata only)
CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    version INTEGER DEFAULT 1
);

-- Flow drafts table (for editing)
CREATE TABLE IF NOT EXISTS flow_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    nodes JSONB NOT NULL DEFAULT '[]',
    settings JSONB NOT NULL DEFAULT '{}',
    theme JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(flow_id)
);

-- Flow published table (for live forms)
CREATE TABLE IF NOT EXISTS flow_published (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    nodes JSONB NOT NULL DEFAULT '[]',
    settings JSONB NOT NULL DEFAULT '{}',
    theme JSONB NOT NULL DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(flow_id, version)
);

-- Form responses table
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    responses JSONB NOT NULL DEFAULT '[]',
    metadata JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'start', 'complete', 'abandon')),
    event_data JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT
);

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flows_status ON flows(status);
CREATE INDEX IF NOT EXISTS idx_flows_created_by ON flows(created_by);
CREATE INDEX IF NOT EXISTS idx_flows_created_at ON flows(created_at);
CREATE INDEX IF NOT EXISTS idx_flow_drafts_flow_id ON flow_drafts(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_published_flow_id ON flow_published(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_published_version ON flow_published(version);
CREATE INDEX IF NOT EXISTS idx_form_responses_flow_id ON form_responses(flow_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON form_responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_analytics_flow_id ON analytics(flow_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_drafts_updated_at BEFORE UPDATE ON flow_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO flows (id, title, description, status, created_by) VALUES
    (uuid_generate_v4(), 'Contact Form', 'Simple contact form for customer inquiries', 'published', 'system'),
    (uuid_generate_v4(), 'Survey Form', 'Customer satisfaction survey', 'draft', 'system'),
    (uuid_generate_v4(), 'Registration Form', 'User registration form', 'published', 'system')
ON CONFLICT DO NOTHING;

-- Create view for analytics summary
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    f.id as flow_id,
    f.title as flow_title,
    f.status as flow_status,
    COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END) as total_views,
    COUNT(DISTINCT CASE WHEN a.event_type = 'start' THEN a.id END) as total_starts,
    COUNT(DISTINCT CASE WHEN a.event_type = 'complete' THEN a.id END) as total_completions,
    COUNT(DISTINCT fr.id) as total_submissions,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END) > 0 
        THEN ROUND(
            (COUNT(DISTINCT fr.id)::DECIMAL / COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END) * 100), 2
        )
        ELSE 0 
    END as conversion_rate
FROM flows f
LEFT JOIN analytics a ON f.id = a.flow_id
LEFT JOIN form_responses fr ON f.id = fr.flow_id
GROUP BY f.id, f.title, f.status;

-- Create view for flow content (combines metadata with draft/published content)
CREATE OR REPLACE VIEW flow_content AS
SELECT 
    f.*,
    fd.nodes as draft_nodes,
    fd.settings as draft_settings,
    fd.theme as draft_theme,
    fp.nodes as published_nodes,
    fp.settings as published_settings,
    fp.theme as published_theme
FROM flows f
LEFT JOIN flow_drafts fd ON f.id = fd.flow_id
LEFT JOIN flow_published fp ON f.id = fp.flow_id AND fp.version = f.version;
