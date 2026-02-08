package model

import (
	"database/sql"
	"time"
)

type Session struct {
	ID               string         `json:"id"`
	UserID           string         `json:"userId"`
	TenantID         string         `json:"tenantId"`
	RefreshTokenHash string         `json:"-"`
	UserAgent        sql.NullString `json:"userAgent,omitempty"`
	IPAddress        sql.NullString `json:"ipAddress,omitempty"`
	DeviceInfo       sql.NullString `json:"deviceInfo,omitempty"`
	ExpiresAt        time.Time      `json:"expiresAt"`
	RevokedAt        sql.NullTime   `json:"revokedAt,omitempty"`
	CreatedAt        time.Time      `json:"createdAt"`
}
