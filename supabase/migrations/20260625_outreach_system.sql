-- Outreach Prospects table
CREATE TABLE outreach_prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'google', 'yelp', etc.
  owner_name TEXT,
  email TEXT,
  rating DECIMAL,
  review_count INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'replied', 'converted', 'rejected')),
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outreach Templates table
CREATE TABLE outreach_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outreach History table for tracking
CREATE TABLE outreach_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES outreach_prospects(id) ON DELETE CASCADE,
  template_id UUID REFERENCES outreach_templates(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent',
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE outreach_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view their prospects" ON outreach_prospects 
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));
CREATE POLICY "Members can manage their prospects" ON outreach_prospects 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Members can view their templates" ON outreach_templates 
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));
CREATE POLICY "Members can manage their templates" ON outreach_templates 
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Members can view their outreach history" ON outreach_history 
  FOR SELECT USING (prospect_id IN (SELECT id FROM outreach_prospects WHERE organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())));
