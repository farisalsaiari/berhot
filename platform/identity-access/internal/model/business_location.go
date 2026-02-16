package model

import (
	"database/sql"
	"time"
)

// BusinessLocation represents a business store/branch location belonging to a tenant.
type BusinessLocation struct {
	ID                  string         `json:"id"`
	TenantID            string         `json:"tenantId"`
	Name                string         `json:"name"`
	BusinessName        sql.NullString `json:"businessName,omitempty"`
	Nickname            sql.NullString `json:"nickname,omitempty"`
	LocationType        string         `json:"locationType"`
	Description         sql.NullString `json:"description,omitempty"`
	AddressLine1        sql.NullString `json:"addressLine1,omitempty"`
	AddressLine2        sql.NullString `json:"addressLine2,omitempty"`
	CityName            sql.NullString `json:"cityName,omitempty"`
	PostalCode          sql.NullString `json:"postalCode,omitempty"`
	Phone               sql.NullString `json:"phone,omitempty"`
	Email               sql.NullString `json:"email,omitempty"`
	Timezone            string         `json:"timezone"`
	Currency            string         `json:"currency"`
	TaxRate             float64        `json:"taxRate"`
	PreferredLanguage   string         `json:"preferredLanguage"`
	Status              string         `json:"status"`
	CreatedAt           time.Time      `json:"createdAt"`
	UpdatedAt           time.Time      `json:"updatedAt"`
}
