-- Migration 005: WebAuthn/Passkey Credentials
-- Stores registered passkeys for passwordless authentication

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id BYTEA NOT NULL UNIQUE,
  public_key BYTEA NOT NULL,
  attestation_type VARCHAR(50) NOT NULL DEFAULT '',
  aaguid BYTEA,
  sign_count BIGINT NOT NULL DEFAULT 0,
  transports TEXT[] DEFAULT '{}',
  friendly_name VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Index for fast credential lookup during authentication
CREATE INDEX idx_webauthn_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX idx_webauthn_user_id ON webauthn_credentials(user_id);
