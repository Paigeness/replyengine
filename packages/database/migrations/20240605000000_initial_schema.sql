-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (linked to auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')),
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  google_place_id TEXT,
  yelp_business_id TEXT,
  tripadvisor_location_id TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('google', 'yelp', 'tripadvisor')),
  source_review_id TEXT NOT NULL,
  author_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  responded BOOLEAN DEFAULT FALSE,
  our_response TEXT,
  response_posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  posted_at TIMESTAMPTZ,
  UNIQUE(source, source_review_id)
);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_model TEXT,
  approved BOOLEAN DEFAULT FALSE,
  posted BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Response Templates table
CREATE TABLE response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tone TEXT CHECK (tone IN ('professional', 'friendly', 'enthusiastic')),
  positive_template TEXT,
  negative_template TEXT,
  neutral_template TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
  plan TEXT CHECK (plan IN ('starter', 'growth', 'agency')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing History table
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount INTEGER, -- cents
  status TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can see their own data
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organization members can see their organization
CREATE POLICY "Members can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())
  );

-- Organization members can see their organization's locations
CREATE POLICY "Members can view their locations" ON locations
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())
  );

-- Organization members can see their organization's reviews
CREATE POLICY "Members can view their reviews" ON reviews
  FOR SELECT USING (
    location_id IN (
      SELECT id FROM locations WHERE organization_id IN (
        SELECT organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Organization members can see their organization's responses
CREATE POLICY "Members can view their responses" ON responses
  FOR SELECT USING (
    location_id IN (
      SELECT id FROM locations WHERE organization_id IN (
        SELECT organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Organization members can see their organization's response templates
CREATE POLICY "Members can view their response templates" ON response_templates
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())
  );

-- Organization members can see their organization's subscriptions
CREATE POLICY "Members can view their subscriptions" ON subscriptions
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())
  );

-- Organization members can see their organization's billing history
CREATE POLICY "Members can view their billing history" ON billing_history
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid())
  );
