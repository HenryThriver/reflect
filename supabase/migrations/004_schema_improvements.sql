-- Schema Improvements Migration
-- Fixes: P2-4, P2-5, P2-6, P2-11, P2-12

-- =============================================================================
-- P2-4: Missing DELETE Policy on Annual Reviews
-- =============================================================================
-- ISSUE: Users cannot delete their own reviews (GDPR violation)
-- FIX: Add DELETE policy for authenticated users to delete their own reviews

CREATE POLICY "Users can delete their reviews"
ON annual_reviews FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- =============================================================================
-- P2-5: Missing UNIQUE Constraint on stripe_subscription_id
-- =============================================================================
-- ISSUE: Duplicate Stripe subscription IDs can be inserted
-- FIX: Add unique constraint to prevent duplicate subscription IDs

ALTER TABLE subscriptions
ADD CONSTRAINT unique_stripe_subscription_id UNIQUE (stripe_subscription_id);

-- =============================================================================
-- P2-6: No JSONB Validation on responses Column
-- =============================================================================
-- ISSUE: The responses field has no schema validation
-- FIX: Add CHECK constraint to ensure responses is a valid JSON object

ALTER TABLE annual_reviews
ADD CONSTRAINT valid_responses_structure
CHECK (jsonb_typeof(responses) = 'object');

-- =============================================================================
-- P2-11: Missing Index on stripe_subscription_id
-- =============================================================================
-- ISSUE: Webhook updates query by stripe_subscription_id without an index
-- FIX: Add index to optimize webhook lookups by Stripe subscription ID

CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- =============================================================================
-- P2-12: CASCADE Deletes Locked Reviews
-- =============================================================================
-- NOTE: user_id ON DELETE CASCADE intentionally kept.
-- Locked reviews are deleted with user accounts per current privacy policy.
-- To archive instead: change to SET NULL and add archived_reviews table.
--
-- RATIONALE:
-- - Current behavior: When a user account is deleted, all their reviews are
--   deleted immediately (ON DELETE CASCADE on user_id foreign key)
-- - This applies to ALL reviews including locked ones
-- - This is appropriate for the current privacy-first approach
-- - Alternative: If review history needs to be preserved for analytics,
--   change FK to ON DELETE SET NULL and migrate deleted user reviews to
--   an archived_reviews table with anonymized data
