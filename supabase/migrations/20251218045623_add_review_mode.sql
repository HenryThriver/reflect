-- Add review_mode column to track handwriting vs digital mode
ALTER TABLE annual_reviews
ADD COLUMN review_mode TEXT DEFAULT 'digital'
  CHECK (review_mode IN ('handwriting', 'digital'));

-- Add index for querying by mode
CREATE INDEX idx_annual_reviews_mode ON annual_reviews(review_mode);
