package handler

import (
	"database/sql"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/gin-gonic/gin"
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
	var email, fn, ln, role, status, tenantID string
	err := h.DB.QueryRow(
		"SELECT email, first_name, last_name, role, status, tenant_id FROM users WHERE id = $1",
		id,
	).Scan(&email, &fn, &ln, &role, &status, &tenantID)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	c.JSON(200, gin.H{"id": id, "email": email, "firstName": fn, "lastName": ln, "role": role, "status": status, "tenantId": tenantID})
}
