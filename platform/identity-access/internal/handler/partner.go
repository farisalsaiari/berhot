package handler

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/gin-gonic/gin"
)

type PartnerHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

// HandleApply handles partner application submissions
// POST /api/v1/partners/apply (public)
func (h *PartnerHandler) HandleApply(c *gin.Context) {
	var req struct {
		FullName    string `json:"fullName"`
		Email       string `json:"email"`
		Company     string `json:"company"`
		Phone       string `json:"phone"`
		PartnerType string `json:"partnerType"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate required fields
	req.FullName = strings.TrimSpace(req.FullName)
	req.Email = strings.TrimSpace(req.Email)
	req.Company = strings.TrimSpace(req.Company)
	req.Phone = strings.TrimSpace(req.Phone)
	req.PartnerType = strings.TrimSpace(req.PartnerType)

	if req.FullName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Full name is required"})
		return
	}
	if req.Email == "" || !emailRegex.MatchString(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A valid email address is required"})
		return
	}
	if req.Company == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Company name is required"})
		return
	}
	if req.PartnerType != "referral" && req.PartnerType != "integration" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Partner type must be 'referral' or 'integration'"})
		return
	}

	// Insert into database
	_, err := h.DB.Exec(`
		INSERT INTO partner_applications (full_name, email, company, phone, partner_type)
		VALUES ($1, $2, $3, $4, $5)
	`, req.FullName, req.Email, req.Company, req.Phone, req.PartnerType)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit application. Please try again."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Application submitted successfully. We'll be in touch soon!",
	})
}

// HandleListApplications lists partner applications (admin only)
// GET /api/v1/partners/applications (requires admin auth)
func (h *PartnerHandler) HandleListApplications(c *gin.Context) {
	status := c.DefaultQuery("status", "")

	var rows *sql.Rows
	var err error

	if status != "" {
		rows, err = h.DB.Query(`
			SELECT id, full_name, email, company, phone, partner_type, status, notes, created_at, updated_at
			FROM partner_applications
			WHERE status = $1
			ORDER BY created_at DESC
			LIMIT 100
		`, status)
	} else {
		rows, err = h.DB.Query(`
			SELECT id, full_name, email, company, phone, partner_type, status, notes, created_at, updated_at
			FROM partner_applications
			ORDER BY created_at DESC
			LIMIT 100
		`)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}
	defer rows.Close()

	type Application struct {
		ID          string  `json:"id"`
		FullName    string  `json:"fullName"`
		Email       string  `json:"email"`
		Company     string  `json:"company"`
		Phone       string  `json:"phone"`
		PartnerType string  `json:"partnerType"`
		Status      string  `json:"status"`
		Notes       *string `json:"notes"`
		CreatedAt   string  `json:"createdAt"`
		UpdatedAt   string  `json:"updatedAt"`
	}

	var applications []Application
	for rows.Next() {
		var app Application
		if err := rows.Scan(&app.ID, &app.FullName, &app.Email, &app.Company, &app.Phone,
			&app.PartnerType, &app.Status, &app.Notes, &app.CreatedAt, &app.UpdatedAt); err != nil {
			continue
		}
		applications = append(applications, app)
	}

	if applications == nil {
		applications = []Application{}
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}
