-- Annual Review Vault Database Schema
-- Run this in your Supabase SQL Editor

-- User subscriptions (synced from Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'canceled', 'past_due', 'inactive')),
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's annual review instances (PAID USERS ONLY)
CREATE TABLE annual_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_slug TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'locked', 'unlocked')),
  current_question_index INTEGER DEFAULT 0,
  responses JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_slug, year)
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_annual_reviews_user ON annual_reviews(user_id);
CREATE INDEX idx_annual_reviews_user_year ON annual_reviews(user_id, year);
CREATE INDEX idx_annual_reviews_status ON annual_reviews(status);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_reviews ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can only view their own
CREATE POLICY "Users view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Prevent authenticated users from inserting subscriptions directly
CREATE POLICY "Prevent client subscription inserts"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (false);

-- Prevent authenticated users from updating subscriptions directly
CREATE POLICY "Prevent client subscription updates"
ON subscriptions FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Prevent authenticated users from deleting subscriptions directly
CREATE POLICY "Prevent client subscription deletes"
ON subscriptions FOR DELETE
TO authenticated
USING (false);

-- Also add policies for anon role to be safe
CREATE POLICY "Prevent anon subscription inserts"
ON subscriptions FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Prevent anon subscription updates"
ON subscriptions FOR UPDATE
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Prevent anon subscription deletes"
ON subscriptions FOR DELETE
TO anon
USING (false);

-- Annual reviews: Users can only access their own
CREATE POLICY "Users own their reviews"
ON annual_reviews FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their reviews"
ON annual_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update draft/unlocked reviews"
ON annual_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('draft', 'unlocked'))
WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annual_reviews_updated_at
  BEFORE UPDATE ON annual_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
