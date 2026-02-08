package model

import (
	"time"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

// WebAuthnCredential stores a registered passkey credential in the database.
type WebAuthnCredential struct {
	ID              string    `json:"id"`
	UserID          string    `json:"userId"`
	CredentialID    []byte    `json:"-"`
	PublicKey       []byte    `json:"-"`
	AttestationType string    `json:"-"`
	AAGUID          []byte    `json:"-"`
	SignCount       uint32    `json:"-"`
	Transports      []string  `json:"-"`
	FriendlyName    string    `json:"friendlyName"`
	CreatedAt       time.Time `json:"createdAt"`
	LastUsedAt      *time.Time `json:"lastUsedAt,omitempty"`
}

// WebAuthnUser implements the webauthn.User interface.
// It wraps our User model with credentials loaded from DB.
type WebAuthnUser struct {
	ID          []byte
	Name        string
	DisplayName string
	Credentials []webauthn.Credential
}

func (u *WebAuthnUser) WebAuthnID() []byte                         { return u.ID }
func (u *WebAuthnUser) WebAuthnName() string                       { return u.Name }
func (u *WebAuthnUser) WebAuthnDisplayName() string                { return u.DisplayName }
func (u *WebAuthnUser) WebAuthnCredentials() []webauthn.Credential { return u.Credentials }

// ToWebAuthnCredential converts a DB row into a webauthn.Credential.
func (c *WebAuthnCredential) ToWebAuthnCredential() webauthn.Credential {
	transports := make([]protocol.AuthenticatorTransport, len(c.Transports))
	for i, t := range c.Transports {
		transports[i] = protocol.AuthenticatorTransport(t)
	}
	return webauthn.Credential{
		ID:              c.CredentialID,
		PublicKey:       c.PublicKey,
		AttestationType: c.AttestationType,
		Authenticator: webauthn.Authenticator{
			AAGUID:    c.AAGUID,
			SignCount: c.SignCount,
		},
		Transport: transports,
	}
}
