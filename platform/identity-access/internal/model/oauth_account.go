package model

import (
	"database/sql"
	"time"
)

type OAuthAccount struct {
	ID             string         `json:"id"`
	UserID         string         `json:"userId"`
	Provider       string         `json:"provider"`
	ProviderUserID string         `json:"providerUserId"`
	ProviderEmail  sql.NullString `json:"providerEmail,omitempty"`
	AccessToken    sql.NullString `json:"-"`
	RefreshToken   sql.NullString `json:"-"`
	TokenExpiresAt sql.NullTime   `json:"-"`
	CreatedAt      time.Time      `json:"createdAt"`
}
