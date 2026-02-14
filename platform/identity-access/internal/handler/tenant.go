package handler

import (
	"database/sql"
	"strings"
	"time"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TenantHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

// Allowed plan values
var allowedPlans = map[string]bool{
	"free": true, "starter": true, "professional": true, "enterprise": true,
}

// GET /api/v1/tenants
func (h *TenantHandler) HandleListTenants(c *gin.Context) {
	rows, err := h.DB.Query("SELECT id, name, slug, status, plan, created_at FROM tenants ORDER BY created_at DESC LIMIT 100")
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	tenants := []gin.H{}
	for rows.Next() {
		var id, name, slug, status, plan string
		var createdAt time.Time
		rows.Scan(&id, &name, &slug, &status, &plan, &createdAt)
		tenants = append(tenants, gin.H{"id": id, "name": name, "slug": slug, "status": status, "plan": plan, "createdAt": createdAt})
	}
	c.JSON(200, gin.H{"tenants": tenants, "total": len(tenants)})
}

// GET /api/v1/tenants/:id
func (h *TenantHandler) HandleGetTenant(c *gin.Context) {
	id := c.Param("id")
	var name, slug, status, plan string
	var createdAt time.Time
	err := h.DB.QueryRow("SELECT name, slug, status, plan, created_at FROM tenants WHERE id = $1", id).
		Scan(&name, &slug, &status, &plan, &createdAt)
	if err != nil {
		c.JSON(404, gin.H{"error": "Tenant not found"})
		return
	}

	rows, _ := h.DB.Query("SELECT product_id, status FROM tenant_products WHERE tenant_id = $1", id)
	defer rows.Close()
	products := []gin.H{}
	for rows.Next() {
		var pid, ps string
		rows.Scan(&pid, &ps)
		products = append(products, gin.H{"productId": pid, "status": ps})
	}

	c.JSON(200, gin.H{"id": id, "name": name, "slug": slug, "status": status, "plan": plan, "createdAt": createdAt, "products": products})
}

// POST /api/v1/tenants
func (h *TenantHandler) HandleCreateTenant(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
		Slug string `json:"slug" binding:"required"`
		Plan string `json:"plan"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.Plan == "" {
		req.Plan = "free"
	}
	id := uuid.New().String()
	_, err := h.DB.Exec("INSERT INTO tenants (id, name, slug, status, plan) VALUES ($1,$2,$3,'active',$4)",
		id, req.Name, req.Slug, req.Plan)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(409, gin.H{"error": "Slug already taken"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "name": req.Name, "slug": req.Slug, "plan": req.Plan, "status": "active"})
}

// GET /api/v1/tenants/me — authenticated user's own tenant
func (h *TenantHandler) HandleGetMyTenant(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}

	var name, slug, status, plan string
	var countryCode, regionID, cityID sql.NullString
	var logoURL, coverURL, registrationNo sql.NullString
	var logoShape sql.NullString
	var showBusinessName sql.NullBool
	var createdAt time.Time
	err := h.DB.QueryRow(
		`SELECT name, slug, status, plan, country_code, region_id::text, city_id::text,
		        COALESCE(logo_url,''), COALESCE(cover_url,''), COALESCE(registration_no,''),
		        COALESCE(logo_shape,'square'), COALESCE(show_business_name,true),
		        created_at
		 FROM tenants WHERE id = $1`,
		tenantID,
	).Scan(&name, &slug, &status, &plan, &countryCode, &regionID, &cityID,
		&logoURL, &coverURL, &registrationNo, &logoShape, &showBusinessName, &createdAt)
	if err != nil {
		c.JSON(404, gin.H{"error": "Tenant not found"})
		return
	}

	shape := "square"
	if logoShape.Valid && logoShape.String != "" {
		shape = logoShape.String
	}
	showName := true
	if showBusinessName.Valid {
		showName = showBusinessName.Bool
	}

	c.JSON(200, gin.H{
		"id": tenantID, "name": name, "slug": slug, "status": status, "plan": plan,
		"countryCode": countryCode.String, "regionId": regionID.String, "cityId": cityID.String,
		"logoUrl": logoURL.String, "coverUrl": coverURL.String, "registrationNo": registrationNo.String,
		"logoShape": shape, "showBusinessName": showName,
		"createdAt": createdAt,
	})
}

// PUT /api/v1/tenants/me — update own tenant info
func (h *TenantHandler) HandleUpdateMyTenant(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}

	var req struct {
		Name             string `json:"name"`
		CountryCode      string `json:"countryCode"`
		RegionID         string `json:"regionId"`
		CityID           string `json:"cityId"`
		RegistrationNo   string `json:"registrationNo"`
		LogoShape        string `json:"logoShape"`
		ShowBusinessName *bool  `json:"showBusinessName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Validate logo shape
	validShapes := map[string]bool{"square": true, "circle": true, "rectangle": true}
	if req.LogoShape != "" && !validShapes[req.LogoShape] {
		c.JSON(400, gin.H{"error": "Invalid logo shape. Allowed: square, circle, rectangle"})
		return
	}

	_, err := h.DB.Exec(
		`UPDATE tenants SET
			name = COALESCE(NULLIF($1,''), name),
			country_code = COALESCE(NULLIF($2,''), country_code),
			region_id = CASE WHEN $3 = '' THEN region_id ELSE $3::uuid END,
			city_id = CASE WHEN $4 = '' THEN city_id ELSE $4::uuid END,
			registration_no = COALESCE(NULLIF($5,''), registration_no),
			logo_shape = COALESCE(NULLIF($6,''), logo_shape),
			show_business_name = COALESCE($7, show_business_name),
			updated_at = NOW()
		WHERE id = $8`,
		req.Name, req.CountryCode, req.RegionID, req.CityID, req.RegistrationNo,
		req.LogoShape, req.ShowBusinessName, tenantID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Update failed", "details": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Tenant updated"})
}

// PUT /api/v1/tenants/me/plan — upgrade/downgrade plan
func (h *TenantHandler) HandleUpdateMyTenantPlan(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}

	var req struct {
		Plan string `json:"plan" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if !allowedPlans[req.Plan] {
		c.JSON(400, gin.H{"error": "Invalid plan. Allowed: free, starter, professional, enterprise"})
		return
	}

	_, err := h.DB.Exec("UPDATE tenants SET plan = $1, updated_at = NOW() WHERE id = $2", req.Plan, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(200, gin.H{"message": "Plan updated", "plan": req.Plan})
}
