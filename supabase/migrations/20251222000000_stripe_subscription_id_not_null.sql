-- Make stripe_subscription_id NOT NULL
-- This column should always be set by the checkout.session.completed webhook

-- First, remove any orphaned subscriptions without a Stripe subscription ID
-- These are invalid records that shouldn't exist
DELETE FROM subscriptions WHERE stripe_subscription_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE subscriptions
ALTER COLUMN stripe_subscription_id SET NOT NULL;
