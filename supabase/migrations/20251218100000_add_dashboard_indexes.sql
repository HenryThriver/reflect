-- Add composite index for dashboard query performance
-- Dashboard queries filter by user_id and order by created_at DESC
-- This index allows index-only scans without additional sort operations

CREATE INDEX IF NOT EXISTS idx_annual_reviews_user_created
ON annual_reviews(user_id, created_at DESC);

-- Add index on webhook_events processed_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
ON webhook_events(processed_at);

-- Comment explaining the purpose
COMMENT ON INDEX idx_annual_reviews_user_created IS
  'Composite index for dashboard query: WHERE user_id = ? ORDER BY created_at DESC';

COMMENT ON INDEX idx_webhook_events_processed_at IS
  'Index for cleanup queries to delete old webhook events';
