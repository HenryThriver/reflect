-- Add RLS policies to prevent client-side writes to subscriptions
-- Only the Stripe webhook (using service role) should write to this table

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
