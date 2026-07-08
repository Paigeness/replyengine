-- Add business profile columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;

-- Add preferences columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'Professional & Friendly';
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_instructions TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_new_reviews BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_daily_summary BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_weekly_report BOOLEAN DEFAULT false;

-- Create RLS policy for members to update their organization
CREATE POLICY "Members can update their organization" ON organizations
  FOR UPDATE USING (id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()))
  WITH CHECK (id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));