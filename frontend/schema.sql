-- Drop tables if they already exist (be careful on production databases!)
-- DROP TABLE IF EXISTS login_attempts CASCADE;
-- DROP TABLE IF EXISTS diagnostic_logs CASCADE;
-- DROP TABLE IF EXISTS usage_analytics CASCADE;
-- DROP TABLE IF EXISTS market_prices CASCADE;
-- DROP TABLE IF EXISTS articles CASCADE;

-- 1. articles Table
CREATE TABLE IF NOT EXISTS articles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  content text,
  source_site text,
  source_url text NOT NULL UNIQUE,
  publish_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. market_prices Table
CREATE TABLE IF NOT EXISTS market_prices (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  crop_name text NOT NULL,
  price_range text NOT NULL,
  trend text NOT NULL,
  change_val text NOT NULL,
  market_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. usage_analytics Table
CREATE TABLE IF NOT EXISTS usage_analytics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id text NOT NULL,
  user_agent text,
  ip_address text,
  location text,
  page_visited text NOT NULL,
  action text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON usage_analytics(session_id);

-- 4. diagnostic_logs Table
CREATE TABLE IF NOT EXISTS diagnostic_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id text,
  crop_name text NOT NULL,
  disease_name text NOT NULL,
  confidence numeric NOT NULL,
  image_url text,
  user_query text,
  ai_response text,
  location text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_crop ON diagnostic_logs(crop_name);

-- 5. login_attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_address text NOT NULL,
  username text NOT NULL,
  attempt_time timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_successful boolean NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_ip_time ON login_attempts(ip_address, attempt_time);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Disable RLS restrictions for SELECT queries on public tables so users can load them
CREATE POLICY "Allow public select articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public select market_prices" ON market_prices FOR SELECT USING (true);

-- Allow public INSERT only for logging tables (usage_analytics and diagnostic_logs)
CREATE POLICY "Allow public insert usage_analytics" ON usage_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert diagnostic_logs" ON diagnostic_logs FOR INSERT WITH CHECK (true);

-- Admin rules are automatically bypassed by the service_role client.
