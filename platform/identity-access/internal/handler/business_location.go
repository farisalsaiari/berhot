package handler

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BusinessLocationHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

// tenantConn returns a *sql.Tx with the tenant context set for RLS.
// The caller MUST call tx.Commit() (or tx.Rollback()) when done.
func (h *BusinessLocationHandler) tenantTx(tenantID string) (*sql.Tx, error) {
	tx, err := h.DB.Begin()
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	if _, err := tx.Exec("SELECT set_tenant_context($1)", tenantID); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("set tenant context: %w", err)
	}
	return tx, nil
}

// GET /api/v1/business-locations — list all locations for the authenticated tenant
func (h *BusinessLocationHandler) HandleListBusinessLocations(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}

	tx, txErr := h.tenantTx(tenantID)
	if txErr != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": txErr.Error()})
		return
	}
	defer tx.Commit()

	search := strings.TrimSpace(c.Query("search"))

	var rows *sql.Rows
	var err error

	if search != "" {
		rows, err = tx.Query(
			`SELECT id, name, COALESCE(business_name,''), COALESCE(nickname,''),
			        COALESCE(location_type,'physical'), COALESCE(address_line1,''),
			        COALESCE(city_name,''), COALESCE(phone,''), COALESCE(email,''),
			        timezone, currency, status, created_at, updated_at
			 FROM locations
			 WHERE tenant_id = $1 AND status != 'inactive'
			   AND (LOWER(name) LIKE '%' || LOWER($2) || '%' OR LOWER(COALESCE(nickname,'')) LIKE '%' || LOWER($2) || '%')
			 ORDER BY created_at ASC`,
			tenantID, search,
		)
	} else {
		rows, err = tx.Query(
			`SELECT id, name, COALESCE(business_name,''), COALESCE(nickname,''),
			        COALESCE(location_type,'physical'), COALESCE(address_line1,''),
			        COALESCE(city_name,''), COALESCE(phone,''), COALESCE(email,''),
			        timezone, currency, status, created_at, updated_at
			 FROM locations
			 WHERE tenant_id = $1 AND status != 'inactive'
			 ORDER BY created_at ASC`,
			tenantID,
		)
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": err.Error()})
		return
	}
	defer rows.Close()

	locations := []gin.H{}
	for rows.Next() {
		var id, name, businessName, nickname, locationType string
		var addressLine1, cityName, phone, email string
		var timezone, currency, status string
		var createdAt, updatedAt time.Time
		rows.Scan(&id, &name, &businessName, &nickname, &locationType,
			&addressLine1, &cityName, &phone, &email,
			&timezone, &currency, &status, &createdAt, &updatedAt)
		locations = append(locations, gin.H{
			"id": id, "name": name, "businessName": businessName, "nickname": nickname,
			"locationType": locationType, "addressLine1": addressLine1,
			"cityName": cityName, "phone": phone, "email": email,
			"timezone": timezone, "currency": currency, "status": status,
			"createdAt": createdAt, "updatedAt": updatedAt,
		})
	}
	c.JSON(200, gin.H{"locations": locations, "total": len(locations)})
}

// GET /api/v1/business-locations/:id — get a single location with full details
func (h *BusinessLocationHandler) HandleGetBusinessLocation(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}
	locID := c.Param("id")

	tx, txErr := h.tenantTx(tenantID)
	if txErr != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": txErr.Error()})
		return
	}
	defer tx.Commit()

	var id, name, businessName, nickname, locationType, description string
	var addressLine1, addressLine2, cityName, postalCode string
	var phone, email, timezone, currency, preferredLanguage, status string
	var taxRate float64
	var businessHours, businessNameChanges string
	var createdAt, updatedAt time.Time

	err := tx.QueryRow(
		`SELECT id, name, COALESCE(business_name,''), COALESCE(nickname,''),
		        COALESCE(location_type,'physical'), COALESCE(description,''),
		        COALESCE(address_line1,''), COALESCE(address_line2,''),
		        COALESCE(city_name,''), COALESCE(postal_code,''),
		        COALESCE(phone,''), COALESCE(email,''),
		        timezone, currency, tax_rate, COALESCE(preferred_language,'en'),
		        status, COALESCE(business_hours::text,'{}'),
		        COALESCE(business_name_changes::text,'[]'),
		        created_at, updated_at
		 FROM locations WHERE id = $1 AND tenant_id = $2`,
		locID, tenantID,
	).Scan(&id, &name, &businessName, &nickname, &locationType, &description,
		&addressLine1, &addressLine2, &cityName, &postalCode,
		&phone, &email, &timezone, &currency, &taxRate, &preferredLanguage,
		&status, &businessHours, &businessNameChanges,
		&createdAt, &updatedAt)

	if err != nil {
		c.JSON(404, gin.H{"error": "Location not found"})
		return
	}

	c.JSON(200, gin.H{
		"id": id, "name": name, "businessName": businessName, "nickname": nickname,
		"locationType": locationType, "description": description,
		"addressLine1": addressLine1, "addressLine2": addressLine2,
		"cityName": cityName, "postalCode": postalCode,
		"phone": phone, "email": email,
		"timezone": timezone, "currency": currency, "taxRate": taxRate,
		"preferredLanguage": preferredLanguage, "status": status,
		"businessHours": businessHours, "businessNameChanges": businessNameChanges,
		"createdAt": createdAt, "updatedAt": updatedAt,
	})
}

// POST /api/v1/business-locations — create a new location
func (h *BusinessLocationHandler) HandleCreateBusinessLocation(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}

	var req struct {
		Name              string  `json:"name" binding:"required"`
		BusinessName      string  `json:"businessName"`
		Nickname          string  `json:"nickname"`
		LocationType      string  `json:"locationType"`
		Description       string  `json:"description"`
		AddressLine1      string  `json:"addressLine1"`
		AddressLine2      string  `json:"addressLine2"`
		CityName          string  `json:"cityName"`
		PostalCode        string  `json:"postalCode"`
		Phone             string  `json:"phone"`
		Email             string  `json:"email"`
		Timezone          string  `json:"timezone"`
		Currency          string  `json:"currency"`
		TaxRate           float64 `json:"taxRate"`
		PreferredLanguage string  `json:"preferredLanguage"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Defaults
	if req.LocationType == "" {
		req.LocationType = "physical"
	}
	if req.Timezone == "" {
		req.Timezone = "Asia/Riyadh"
	}
	if req.Currency == "" {
		req.Currency = "SAR"
	}
	if req.PreferredLanguage == "" {
		req.PreferredLanguage = "en"
	}
	if req.BusinessName == "" {
		req.BusinessName = req.Name
	}

	tx, txErr := h.tenantTx(tenantID)
	if txErr != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": txErr.Error()})
		return
	}

	id := uuid.New().String()
	now := time.Now()

	_, err := tx.Exec(
		`INSERT INTO locations (id, tenant_id, name, business_name, nickname, location_type,
		 description, address_line1, address_line2, city_name, postal_code,
		 phone, email, timezone, currency, tax_rate, preferred_language,
		 status, created_at, updated_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'active',$18,$18)`,
		id, tenantID, req.Name, req.BusinessName, req.Nickname, req.LocationType,
		req.Description, req.AddressLine1, req.AddressLine2, req.CityName, req.PostalCode,
		req.Phone, req.Email, req.Timezone, req.Currency, req.TaxRate, req.PreferredLanguage,
		now,
	)
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to create location", "details": err.Error()})
		return
	}
	tx.Commit()

	c.JSON(201, gin.H{
		"id": id, "name": req.Name, "businessName": req.BusinessName,
		"nickname": req.Nickname, "locationType": req.LocationType,
		"status": "active", "createdAt": now,
	})
}

// PUT /api/v1/business-locations/:id — update a location
func (h *BusinessLocationHandler) HandleUpdateBusinessLocation(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}
	locID := c.Param("id")

	var req struct {
		Name              string  `json:"name"`
		BusinessName      string  `json:"businessName"`
		Nickname          string  `json:"nickname"`
		LocationType      string  `json:"locationType"`
		Description       string  `json:"description"`
		AddressLine1      string  `json:"addressLine1"`
		AddressLine2      string  `json:"addressLine2"`
		CityName          string  `json:"cityName"`
		PostalCode        string  `json:"postalCode"`
		Phone             string  `json:"phone"`
		Email             string  `json:"email"`
		Timezone          string  `json:"timezone"`
		Currency          string  `json:"currency"`
		TaxRate           *float64 `json:"taxRate"`
		PreferredLanguage string  `json:"preferredLanguage"`
		BusinessHours     string  `json:"businessHours"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	tx, txErr := h.tenantTx(tenantID)
	if txErr != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": txErr.Error()})
		return
	}

	// Verify location belongs to tenant
	var exists int
	err := tx.QueryRow("SELECT 1 FROM locations WHERE id = $1 AND tenant_id = $2", locID, tenantID).Scan(&exists)
	if err != nil {
		tx.Rollback()
		c.JSON(404, gin.H{"error": "Location not found"})
		return
	}

	_, err = tx.Exec(
		`UPDATE locations SET
			name = COALESCE(NULLIF($1,''), name),
			business_name = COALESCE(NULLIF($2,''), business_name),
			nickname = COALESCE(NULLIF($3,''), nickname),
			location_type = COALESCE(NULLIF($4,''), location_type),
			description = COALESCE(NULLIF($5,''), description),
			address_line1 = COALESCE(NULLIF($6,''), address_line1),
			address_line2 = COALESCE(NULLIF($7,''), address_line2),
			city_name = COALESCE(NULLIF($8,''), city_name),
			postal_code = COALESCE(NULLIF($9,''), postal_code),
			phone = COALESCE(NULLIF($10,''), phone),
			email = COALESCE(NULLIF($11,''), email),
			timezone = COALESCE(NULLIF($12,''), timezone),
			currency = COALESCE(NULLIF($13,''), currency),
			preferred_language = COALESCE(NULLIF($14,''), preferred_language),
			business_hours = CASE WHEN $15 = '' THEN business_hours ELSE $15::jsonb END,
			updated_at = NOW()
		WHERE id = $16 AND tenant_id = $17`,
		req.Name, req.BusinessName, req.Nickname, req.LocationType,
		req.Description, req.AddressLine1, req.AddressLine2, req.CityName,
		req.PostalCode, req.Phone, req.Email, req.Timezone, req.Currency,
		req.PreferredLanguage, req.BusinessHours,
		locID, tenantID,
	)
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Update failed", "details": err.Error()})
		return
	}
	tx.Commit()
	c.JSON(200, gin.H{"message": "Location updated"})
}

// DELETE /api/v1/business-locations/:id — deactivate (soft delete) a location
func (h *BusinessLocationHandler) HandleDeactivateBusinessLocation(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}
	locID := c.Param("id")

	tx, txErr := h.tenantTx(tenantID)
	if txErr != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": txErr.Error()})
		return
	}

	result, err := tx.Exec(
		"UPDATE locations SET status = 'inactive', updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
		locID, tenantID,
	)
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Deactivation failed"})
		return
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		tx.Rollback()
		c.JSON(404, gin.H{"error": "Location not found"})
		return
	}
	tx.Commit()
	c.JSON(200, gin.H{"message": "Location deactivated"})
}
