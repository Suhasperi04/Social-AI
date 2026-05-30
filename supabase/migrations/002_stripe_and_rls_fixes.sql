-- ============================================
-- Migration 002: Stripe columns + RLS hardening
-- ============================================

-- Add Stripe billing columns missing from the initial schema
ALTER TABLE instagram_accounts
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer ON instagram_accounts(stripe_customer_id);

-- ============================================
-- RLS hardening
-- Drop the permissive catch-all policies created in migration 001.
-- All app reads/writes go through API routes that use the service role
-- key (which bypasses RLS entirely), so these client-facing policies
-- should deny everything — defence-in-depth if the anon key leaks.
-- ============================================

-- instagram_accounts
DROP POLICY IF EXISTS "service_role_all_accounts" ON instagram_accounts;
CREATE POLICY "deny_all_client_accounts" ON instagram_accounts
  FOR ALL USING (false);

-- usage
DROP POLICY IF EXISTS "service_role_all_usage" ON usage;
CREATE POLICY "deny_all_client_usage" ON usage
  FOR ALL USING (false);

-- reports
DROP POLICY IF EXISTS "service_role_all_reports" ON reports;
CREATE POLICY "deny_all_client_reports" ON reports
  FOR ALL USING (false);

-- competitors
DROP POLICY IF EXISTS "service_role_all_competitors" ON competitors;
CREATE POLICY "deny_all_client_competitors" ON competitors
  FOR ALL USING (false);

-- rate_limits
DROP POLICY IF EXISTS "service_role_all_rate_limits" ON rate_limits;
CREATE POLICY "deny_all_client_rate_limits" ON rate_limits
  FOR ALL USING (false);
