-- Outreach Emails table for single send tracking
CREATE TABLE outreach_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'opened')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view their outreach emails" ON outreach_emails
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Members can manage their outreach emails" ON outreach_emails
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));
