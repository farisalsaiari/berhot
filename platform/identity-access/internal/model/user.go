package model

import (
	"database/sql"
	"time"
)

type User struct {
	ID              string         `json:"id"`
	TenantID        string         `json:"tenantId"`
	Email           string         `json:"email"`
	PasswordHash    sql.NullString `json:"-"`
	FirstName       string         `json:"firstName"`
	LastName        string         `json:"lastName"`
	Phone           sql.NullString `json:"phone,omitempty"`
	Role            string         `json:"role"`
	Status          string         `json:"status"`
	AuthProvider    string         `json:"authProvider"`
	EmailVerifiedAt sql.NullTime   `json:"-"`
	PhoneVerifiedAt sql.NullTime   `json:"-"`
	LastLoginAt     sql.NullTime   `json:"lastLoginAt,omitempty"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
}
