package model

import (
	"database/sql"
	"time"
)

type OTPCode struct {
	ID          string       `json:"id"`
	Identifier  string       `json:"identifier"`
	CodeHash    string       `json:"-"`
	Purpose     string       `json:"purpose"`
	Attempts    int          `json:"attempts"`
	MaxAttempts int          `json:"maxAttempts"`
	ExpiresAt   time.Time    `json:"expiresAt"`
	VerifiedAt  sql.NullTime `json:"verifiedAt,omitempty"`
	CreatedAt   time.Time    `json:"createdAt"`
}
