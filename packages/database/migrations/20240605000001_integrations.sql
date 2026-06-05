-- Integrations table to store OAuth tokens and settings
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('google', 'yelp', 'tripadvisor')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, source)
);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Members can view their integrations" ON integrations
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Members can update their integrations" ON integrations
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())
  );

-- Add integration IDs to locations
ALTER TABLE locations ADD COLUMN google_business_location_id TEXT;
ALTER TABLE locations ADD COLUMN yelp_business_id TEXT;
ALTER TABLE locations ADD COLUMN tripadvisor_location_id TEXT;
