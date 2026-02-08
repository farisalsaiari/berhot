package handler

import (
	"database/sql"
	"strings"
	"time"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

// GET /api/v1/users/me
func (h *UserHandler) HandleGetCurrentUser(c *gin.Context) {
	userID := c.GetString("userId")
	var email, firstName, lastName, role, status, tenantID string
	var lastLogin sql.NullTime
	err := h.DB.QueryRow(
		"SELECT email, first_name, last_name, role, status, tenant_id, last_login_at FROM users WHERE id = $1",
		userID,
	).Scan(&email, &firstName, &lastName, &role, &status, &tenantID, &lastLogin)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	c.JSON(200, gin.H{
		"id": userID, "email": email, "firstName": firstName, "lastName": lastName,
		"role": role, "status": status, "tenantId": tenantID,
	})
}

// PUT /api/v1/users/me
func (h *UserHandler) HandleUpdateCurrentUser(c *gin.Context) {
	userID := c.GetString("userId")
	var req struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Phone     string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	_, err := h.DB.Exec(
		"UPDATE users SET first_name = COALESCE(NULLIF($1,''), first_name), last_name = COALESCE(NULLIF($2,''), last_name), phone = COALESCE(NULLIF($3,''), phone) WHERE id = $4",
		req.FirstName, req.LastName, req.Phone, userID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(200, gin.H{"message": "Profile updated"})
}

// GET /api/v1/users
func (h *UserHandler) HandleListUsers(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := h.DB.Query(
		"SELECT id, email, first_name, last_name, role, status, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100",
		tenantID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	users := []gin.H{}
	for rows.Next() {
		var id, email, fn, ln, role, status string
		var createdAt time.Time
		rows.Scan(&id, &email, &fn, &ln, &role, &status, &createdAt)
		users = append(users, gin.H{
			"id": id, "email": email, "firstName": fn, "lastName": ln,
			"role": role, "status": status, "createdAt": createdAt,
		})
	}
	c.JSON(200, gin.H{"users": users, "total": len(users)})
}

// GET /api/v1/users/:id
func (h *UserHandler) HandleGetUser(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	var email, fn, ln, role, status string
	err := h.DB.QueryRow(
		"SELECT email, first_name, last_name, role, status FROM users WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	).Scan(&email, &fn, &ln, &role, &status)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	c.JSON(200, gin.H{"id": id, "email": email, "firstName": fn, "lastName": ln, "role": role, "status": status, "tenantId": tenantID})
}

// POST /api/v1/users
func (h *UserHandler) HandleCreateUser(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required,min=8"`
		FirstName string `json:"firstName" binding:"required"`
		LastName  string `json:"lastName" binding:"required"`
		Role      string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), h.Cfg.BcryptCost)
	id := uuid.New().String()
	_, err := h.DB.Exec(
		"INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, status, email_verified_at) VALUES ($1,$2,$3,$4,$5,$6,$7,'active',NOW())",
		id, tenantID, req.Email, string(hash), req.FirstName, req.LastName, req.Role,
	)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(409, gin.H{"error": "Email already exists"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "email": req.Email, "firstName": req.FirstName, "lastName": req.LastName, "role": req.Role, "tenantId": tenantID})
}

// DELETE /api/v1/users/:id
func (h *UserHandler) HandleDeleteUser(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	res, err := h.DB.Exec("DELETE FROM users WHERE id = $1 AND tenant_id = $2", id, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Delete failed"})
		return
	}
	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	c.JSON(200, gin.H{"message": "User deleted"})
}
