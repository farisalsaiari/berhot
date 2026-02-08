package handler

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// AdminHandler handles system/company admin auth — completely separate from customer auth.
// Uses separate tables: admin_users, admin_sessions
// Endpoints live under /api/v1/admin/auth/* for full isolation.
type AdminHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

var validAdminRoles = map[string]bool{
	"super_admin":   true,
	"system_admin":  true,
	"support_agent": true,
	"finance_admin": true,
}

// AdminClaims — distinct from customer Claims (different issuer)
type AdminClaims struct {
	AdminID string `json:"adminId"`
	Email   string `json:"email"`
	Role    string `json:"role"`
	jwt.RegisteredClaims
}

func (h *AdminHandler) generateAdminTokens(adminID, email, role, sessionID string) (string, string, error) {
	now := time.Now()

	accessClaims := AdminClaims{
		AdminID: adminID,
		Email:   email,
		Role:    role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(h.Cfg.JWTAccessTTL) * time.Second)),
			IssuedAt:  jwt.NewNumericDate(now),
			Issuer:    "berhot-admin", // Different issuer from customer tokens
			Subject:   sessionID,
		},
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString(h.Cfg.JWTSecret)
	if err != nil {
		return "", "", err
	}

	refreshClaims := AdminClaims{
		AdminID: adminID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(h.Cfg.JWTRefreshTTL) * time.Second)),
			IssuedAt:  jwt.NewNumericDate(now),
			Issuer:    "berhot-admin",
			Subject:   sessionID,
		},
	}
	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString(h.Cfg.JWTSecret)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (h *AdminHandler) parseAdminToken(tokenStr string) (*AdminClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &AdminClaims{}, func(t *jwt.Token) (interface{}, error) {
		return h.Cfg.JWTSecret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*AdminClaims)
	if !ok || !token.Valid || claims.Issuer != "berhot-admin" {
		return nil, fmt.Errorf("invalid admin token")
	}
	return claims, nil
}

// AdminAuthMiddleware — separate from customer auth middleware
func (h *AdminHandler) AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(401, gin.H{"error": "Missing or invalid Authorization header"})
			return
		}

		claims, err := h.parseAdminToken(strings.TrimPrefix(auth, "Bearer "))
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid admin token"})
			return
		}

		// Verify session is not revoked
		if claims.Subject != "" {
			var revokedAt sql.NullTime
			err := h.DB.QueryRow("SELECT revoked_at FROM admin_sessions WHERE id = $1", claims.Subject).Scan(&revokedAt)
			if err != nil || revokedAt.Valid {
				c.AbortWithStatusJSON(401, gin.H{"error": "Admin session has been revoked"})
				return
			}
		}

		c.Set("adminId", claims.AdminID)
		c.Set("adminEmail", claims.Email)
		c.Set("adminRole", claims.Role)
		c.Next()
	}
}

// POST /api/v1/admin/auth/login
func (h *AdminHandler) HandleAdminLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var id, passwordHash, firstName, lastName, role, status string
	err := h.DB.QueryRow(
		"SELECT id, password_hash, first_name, last_name, role, status FROM admin_users WHERE email = $1",
		req.Email,
	).Scan(&id, &passwordHash, &firstName, &lastName, &role, &status)

	if err == sql.ErrNoRows {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	if status != "active" {
		c.JSON(403, gin.H{"error": "Account is not active"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	h.DB.Exec("UPDATE admin_users SET last_login_at = NOW() WHERE id = $1", id)

	sessionID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO admin_sessions (id, admin_id, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
		sessionID, id, c.GetHeader("User-Agent"), c.ClientIP(),
	)

	accessToken, refreshToken, _ := h.generateAdminTokens(id, req.Email, role, sessionID)

	c.JSON(200, gin.H{
		"admin": gin.H{
			"id": id, "email": req.Email,
			"firstName": firstName, "lastName": lastName,
			"role": role,
		},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

// POST /api/v1/admin/auth/signup — Bootstrap first super_admin (disabled after)
func (h *AdminHandler) HandleAdminSignup(c *gin.Context) {
	var req struct {
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required,min=10"`
		FirstName string `json:"firstName" binding:"required"`
		LastName  string `json:"lastName" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var adminCount int
	h.DB.QueryRow("SELECT COUNT(*) FROM admin_users WHERE role = 'super_admin'").Scan(&adminCount)
	if adminCount > 0 {
		c.JSON(403, gin.H{"error": "Admin signup is disabled. Use invite flow."})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), h.Cfg.BcryptCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	id := uuid.New().String()
	_, err = h.DB.Exec(
		`INSERT INTO admin_users (id, email, password_hash, first_name, last_name, role, status)
		 VALUES ($1, $2, $3, $4, $5, 'super_admin', 'active')`,
		id, req.Email, string(hash), req.FirstName, req.LastName,
	)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(409, gin.H{"error": "Email already registered"})
			return
		}
		c.JSON(500, gin.H{"error": "Failed to create admin", "details": err.Error()})
		return
	}

	sessionID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO admin_sessions (id, admin_id, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
		sessionID, id, c.GetHeader("User-Agent"), c.ClientIP(),
	)

	accessToken, refreshToken, _ := h.generateAdminTokens(id, req.Email, "super_admin", sessionID)

	c.JSON(201, gin.H{
		"admin": gin.H{
			"id": id, "email": req.Email,
			"firstName": req.FirstName, "lastName": req.LastName,
			"role": "super_admin",
		},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

// POST /api/v1/admin/auth/invite
func (h *AdminHandler) HandleAdminInvite(c *gin.Context) {
	callerRole := c.GetString("adminRole")
	if callerRole != "super_admin" && callerRole != "system_admin" {
		c.JSON(403, gin.H{"error": "Only super_admin or system_admin can invite admins"})
		return
	}

	var req struct {
		Email     string `json:"email" binding:"required,email"`
		FirstName string `json:"firstName" binding:"required"`
		LastName  string `json:"lastName" binding:"required"`
		Role      string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if !validAdminRoles[req.Role] {
		c.JSON(400, gin.H{"error": "Invalid role. Valid: super_admin, system_admin, support_agent, finance_admin"})
		return
	}
	if req.Role == "super_admin" && callerRole != "super_admin" {
		c.JSON(403, gin.H{"error": "Only super_admin can create other super_admins"})
		return
	}

	tempPassword := uuid.New().String()[:16]
	hash, _ := bcrypt.GenerateFromPassword([]byte(tempPassword), h.Cfg.BcryptCost)

	id := uuid.New().String()
	callerID := c.GetString("adminId")
	_, err := h.DB.Exec(
		`INSERT INTO admin_users (id, email, password_hash, first_name, last_name, role, status, invited_by)
		 VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)`,
		id, req.Email, string(hash), req.FirstName, req.LastName, req.Role, callerID,
	)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(409, gin.H{"error": "Email already registered"})
			return
		}
		c.JSON(500, gin.H{"error": "Failed to invite admin"})
		return
	}

	c.JSON(201, gin.H{
		"admin": gin.H{
			"id": id, "email": req.Email,
			"firstName": req.FirstName, "lastName": req.LastName,
			"role": req.Role,
		},
		"tempPassword": tempPassword,
		"invitedAt":    time.Now(),
		"message":      "Share the temporary password securely. Admin must change on first login.",
	})
}

// POST /api/v1/admin/auth/refresh
func (h *AdminHandler) HandleAdminRefresh(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	claims, err := h.parseAdminToken(req.RefreshToken)
	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid refresh token"})
		return
	}

	// Verify session
	if claims.Subject != "" {
		var revokedAt sql.NullTime
		err := h.DB.QueryRow("SELECT revoked_at FROM admin_sessions WHERE id = $1", claims.Subject).Scan(&revokedAt)
		if err != nil || revokedAt.Valid {
			c.JSON(401, gin.H{"error": "Session revoked"})
			return
		}
	}

	var email, role string
	err = h.DB.QueryRow("SELECT email, role FROM admin_users WHERE id = $1 AND status = 'active'", claims.AdminID).Scan(&email, &role)
	if err != nil {
		c.JSON(401, gin.H{"error": "Admin not found"})
		return
	}

	accessToken, refreshToken, _ := h.generateAdminTokens(claims.AdminID, email, role, claims.Subject)
	c.JSON(200, gin.H{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

// POST /api/v1/admin/auth/logout
func (h *AdminHandler) HandleAdminLogout(c *gin.Context) {
	// Get session ID from token subject
	auth := c.GetHeader("Authorization")
	if auth != "" {
		claims, err := h.parseAdminToken(strings.TrimPrefix(auth, "Bearer "))
		if err == nil && claims.Subject != "" {
			h.DB.Exec("UPDATE admin_sessions SET revoked_at = NOW() WHERE id = $1", claims.Subject)
		}
	}
	c.JSON(200, gin.H{"message": "Logged out"})
}

// GET /api/v1/admin/users
func (h *AdminHandler) HandleListAdmins(c *gin.Context) {
	callerRole := c.GetString("adminRole")
	if callerRole != "super_admin" && callerRole != "system_admin" {
		c.JSON(403, gin.H{"error": "Insufficient permissions"})
		return
	}

	rows, err := h.DB.Query(
		`SELECT id, email, first_name, last_name, role, status, last_login_at, created_at
		 FROM admin_users ORDER BY created_at DESC LIMIT 100`,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	admins := []gin.H{}
	for rows.Next() {
		var id, email, fn, ln, role, status string
		var lastLogin sql.NullTime
		var createdAt time.Time
		rows.Scan(&id, &email, &fn, &ln, &role, &status, &lastLogin, &createdAt)
		admins = append(admins, gin.H{
			"id": id, "email": email, "firstName": fn, "lastName": ln,
			"role": role, "status": status, "createdAt": createdAt,
		})
	}
	c.JSON(200, gin.H{"admins": admins, "total": len(admins)})
}
