-- Add value_forest column to store Value Forest state for authenticated users
-- This enables cross-device sync and prevents data loss when localStorage is cleared

ALTER TABLE public.annual_reviews
ADD COLUMN IF NOT EXISTS value_forest JSONB DEFAULT NULL;

-- Add a comment explaining the structure
COMMENT ON COLUMN public.annual_reviews.value_forest IS
'Value Forest state: { phase, selectedTreeIds, customTrees, currentTreeIndex, currentQuestionIndex, responses, ranking, overviewResponses }';
