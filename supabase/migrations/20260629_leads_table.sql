-- Leads table for Lead Finder tool
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category TEXT,
  city TEXT,
  rating DECIMAL,
  address TEXT,
  website TEXT,
  phone TEXT,
  review_response_rate DECIMAL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'not_interested', 'qualified')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view their leads" ON leads
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Members can manage their leads" ON leads
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));
