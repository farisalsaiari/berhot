-- ============================================================
-- Migration 006: Partner Applications
-- ============================================================

-- Partner application submissions from the /partners page
CREATE TABLE IF NOT EXISTS partner_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  partner_type VARCHAR(50) NOT NULL CHECK (partner_type IN ('referral', 'integration')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_apps_email ON partner_applications(email);
CREATE INDEX IF NOT EXISTS idx_partner_apps_status ON partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_partner_apps_type ON partner_applications(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_apps_created ON partner_applications(created_at DESC);
