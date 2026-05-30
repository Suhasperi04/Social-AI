-- ============================================
-- SocialPulse AI — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Instagram Accounts (the "user" table)
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_id TEXT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT,
  profile_picture_url TEXT,
  biography TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  account_type TEXT CHECK (account_type IN ('BUSINESS', 'CREATOR')),
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  trial_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE IF NOT EXISTS usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_id TEXT UNIQUE NOT NULL REFERENCES instagram_accounts(instagram_id) ON DELETE CASCADE,
  reports_used INTEGER DEFAULT 0,
  competitor_analyses_used INTEGER DEFAULT 0,
  ideas_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (cached AI analysis)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_id TEXT NOT NULL REFERENCES instagram_accounts(instagram_id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'account_health', 'profile_analysis', 'growth_blockers',
    'winning_content', 'content_ideas', 'best_time', 'growth_plan'
  )),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_id TEXT NOT NULL REFERENCES instagram_accounts(instagram_id) ON DELETE CASCADE,
  competitor_username TEXT NOT NULL,
  competitor_data JSONB,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instagram_id, competitor_username)
);

-- Rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, endpoint)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reports_instagram_id ON reports(instagram_id);
CREATE INDEX IF NOT EXISTS idx_reports_type_expires ON reports(report_type, expires_at);
CREATE INDEX IF NOT EXISTS idx_competitors_instagram_id ON competitors(instagram_id);
CREATE INDEX IF NOT EXISTS idx_usage_instagram_id ON usage(instagram_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_accounts_instagram_id ON instagram_accounts(instagram_id);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role policies (API routes use service role key which bypasses RLS)
-- These policies are for any direct client-side access
CREATE POLICY "service_role_all_accounts" ON instagram_accounts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_usage" ON usage
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_reports" ON reports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_competitors" ON competitors
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_rate_limits" ON rate_limits
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Functions
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON instagram_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_usage_updated_at
  BEFORE UPDATE ON usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Clean expired reports (run periodically)
CREATE OR REPLACE FUNCTION clean_expired_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM reports WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
