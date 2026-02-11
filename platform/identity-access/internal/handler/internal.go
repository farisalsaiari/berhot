package handler

import (
	"database/sql"
	"strings"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type InternalHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

// POST /internal/validate-token
func (h *InternalHandler) HandleValidateToken(c *gin.Context) {
	var req struct {
		Token string `json:"token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	claims, err := model.ParseToken(req.Token, h.Cfg.JWTSecret)
	if err != nil {
		c.JSON(401, gin.H{"valid": false, "error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"valid": true, "userId": claims.UserID, "tenantId": claims.TenantID, "email": claims.Email, "role": claims.Role})
}

// GET /internal/users/:id
func (h *InternalHandler) HandleInternalGetUser(c *gin.Context) {
	id := c.Param("id")
	var fn, ln, role, status, tenantID string
	var email, phone sql.NullString
	var passwordHash sql.NullString
	var emailVerifiedAt, phoneVerifiedAt sql.NullTime
	err := h.DB.QueryRow(
		"SELECT COALESCE(email, ''), COALESCE(phone, ''), first_name, last_name, role, status, tenant_id, email_verified_at, phone_verified_at, password_hash FROM users WHERE id = $1",
		id,
	).Scan(&email, &phone, &fn, &ln, &role, &status, &tenantID, &emailVerifiedAt, &phoneVerifiedAt, &passwordHash)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	c.JSON(200, gin.H{
		"id": id, "email": email.String, "phone": phone.String,
		"firstName": fn, "lastName": ln, "role": role, "status": status, "tenantId": tenantID,
		"emailVerified": emailVerifiedAt.Valid, "phoneVerified": phoneVerifiedAt.Valid,
		"hasPassword": passwordHash.Valid && passwordHash.String != "",
	})
}

// PUT /internal/users/:id/email — service-to-service email update (used by email-service after verification)
func (h *InternalHandler) HandleInternalUpdateEmail(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	email := strings.TrimSpace(strings.ToLower(req.Email))

	// Check if email is already taken by another user
	var existingID string
	err := h.DB.QueryRow("SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2 AND status = 'active'", email, id).Scan(&existingID)
	if err == nil {
		c.JSON(409, gin.H{"error": "Email is already associated with another account"})
		return
	}

	_, err = h.DB.Exec("UPDATE users SET email = $1, email_verified_at = NOW() WHERE id = $2", email, id)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(409, gin.H{"error": "Email is already associated with another account"})
			return
		}
		c.JSON(500, gin.H{"error": "Failed to update email"})
		return
	}

	c.JSON(200, gin.H{"message": "Email updated", "email": email})
}

// PUT /internal/users/:id/phone — service-to-service phone update (used after OTP verification)
func (h *InternalHandler) HandleInternalUpdatePhone(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Phone string `json:"phone" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	phone := NormalizePhone(req.Phone)

	// Check if phone is already taken by another user
	var existingID string
	err := h.DB.QueryRow("SELECT id FROM users WHERE phone = $1 AND id != $2 AND status = 'active'", phone, id).Scan(&existingID)
	if err == nil {
		c.JSON(409, gin.H{"error": "This phone number is already associated with another account"})
		return
	}

	_, err = h.DB.Exec("UPDATE users SET phone = $1, phone_verified_at = NOW() WHERE id = $2", phone, id)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(409, gin.H{"error": "This phone number is already associated with another account"})
			return
		}
		c.JSON(500, gin.H{"error": "Failed to update phone"})
		return
	}

	c.JSON(200, gin.H{"message": "Phone updated", "phone": phone})
}

// GET /internal/check-phone?phone=...&exclude_user_id=... — check if phone is already registered
func (h *InternalHandler) HandleInternalCheckPhone(c *gin.Context) {
	phone := NormalizePhone(c.Query("phone"))
	if phone == "" {
		c.JSON(400, gin.H{"error": "phone query param is required"})
		return
	}

	excludeUserID := c.Query("exclude_user_id")

	var id string
	var err error
	if excludeUserID != "" {
		err = h.DB.QueryRow("SELECT id FROM users WHERE phone = $1 AND id != $2 AND status = 'active'", phone, excludeUserID).Scan(&id)
	} else {
		err = h.DB.QueryRow("SELECT id FROM users WHERE phone = $1 AND status = 'active'", phone).Scan(&id)
	}

	if err == sql.ErrNoRows {
		c.JSON(200, gin.H{"taken": false})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	c.JSON(200, gin.H{"taken": true})
}

// PUT /internal/users/:id/password — set or update password (used from account settings)
func (h *InternalHandler) HandleInternalSetPassword(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if len(req.Password) < 8 {
		c.JSON(400, gin.H{"error": "Password must be at least 8 characters"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	_, err = h.DB.Exec("UPDATE users SET password_hash = $1 WHERE id = $2", string(hash), id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to set password"})
		return
	}

	c.JSON(200, gin.H{"message": "Password set"})
}

// GET /internal/users/check-email?email=... — check if email is already registered
func (h *InternalHandler) HandleInternalCheckEmail(c *gin.Context) {
	email := strings.TrimSpace(strings.ToLower(c.Query("email")))
	if email == "" {
		c.JSON(400, gin.H{"error": "email query param is required"})
		return
	}

	excludeUserID := c.Query("exclude_user_id")

	var id string
	var err error
	if excludeUserID != "" {
		err = h.DB.QueryRow("SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2 AND status = 'active'", email, excludeUserID).Scan(&id)
	} else {
		err = h.DB.QueryRow("SELECT id FROM users WHERE LOWER(email) = $1 AND status = 'active'", email).Scan(&id)
	}

	if err == sql.ErrNoRows {
		c.JSON(200, gin.H{"taken": false})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	c.JSON(200, gin.H{"taken": true})
}
