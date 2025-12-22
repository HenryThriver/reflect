-- Make stripe_subscription_id NOT NULL
-- This column should always be set by the checkout.session.completed webhook

-- Safety: Log any orphaned subscriptions before removal
-- Run this SELECT first to audit what will be deleted:
-- SELECT id, user_id, status, created_at FROM subscriptions WHERE stripe_subscription_id IS NULL;

-- Only delete if there are orphaned records (these are invalid - created without completing checkout)
-- In production, verify count is 0 or expected before proceeding
DELETE FROM subscriptions WHERE stripe_subscription_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE subscriptions
ALTER COLUMN stripe_subscription_id SET NOT NULL;
