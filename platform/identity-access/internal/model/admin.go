package model

import (
	"database/sql"
	"time"
)

type AdminUser struct {
	ID           string       `json:"id"`
	Email        string       `json:"email"`
	PasswordHash string       `json:"-"`
	FirstName    string       `json:"firstName"`
	LastName     string       `json:"lastName"`
	Role         string       `json:"role"`
	Status       string       `json:"status"`
	LastLoginAt  sql.NullTime `json:"lastLoginAt,omitempty"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
	InvitedBy    sql.NullString `json:"invitedBy,omitempty"`
}

// AdminClaims uses a different issuer to distinguish from customer JWTs
type AdminClaims struct {
	AdminID string `json:"adminId"`
	Email   string `json:"email"`
	Role    string `json:"role"`
}
