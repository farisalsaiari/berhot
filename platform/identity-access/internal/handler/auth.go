package handler

import (
	"database/sql"
	"regexp"
	"strings"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

var phoneRegex = regexp.MustCompile(`^\+?\d{8,15}$`)
var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func IsPhone(identifier string) bool {
	cleaned := strings.ReplaceAll(strings.ReplaceAll(identifier, " ", ""), "-", "")
	return phoneRegex.MatchString(cleaned)
}

func IsEmail(identifier string) bool {
	return emailRegex.MatchString(identifier)
}

// POST /api/v1/auth/check-user
func (h *AuthHandler) HandleCheckUser(c *gin.Context) {
	var req struct {
		Identifier string `json:"identifier" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	identifier := strings.TrimSpace(req.Identifier)
	isPhone := IsPhone(identifier)

	var id, authProvider string
	var err error

	if isPhone {
		cleaned := strings.ReplaceAll(strings.ReplaceAll(identifier, " ", ""), "-", "")
		err = h.DB.QueryRow(
			"SELECT id, COALESCE(auth_provider, 'phone') FROM users WHERE phone = $1 AND status = 'active'",
			cleaned,
		).Scan(&id, &authProvider)
	} else {
		err = h.DB.QueryRow(
			"SELECT id, COALESCE(auth_provider, 'email') FROM users WHERE email = $1 AND status = 'active'",
			identifier,
		).Scan(&id, &authProvider)
	}

	if err == sql.ErrNoRows {
		c.JSON(200, gin.H{"exists": false})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	method := "password"
	if isPhone || authProvider == "phone" {
		method = "otp"
	}

	resp := gin.H{"exists": true, "method": method}
	if method == "otp" && isPhone {
		// Mask phone for display
		if len(identifier) > 4 {
			resp["destination"] = strings.Repeat("*", len(identifier)-4) + identifier[len(identifier)-4:]
		}
	}

	c.JSON(200, resp)
}

// POST /api/v1/auth/register
func (h *AuthHandler) HandleRegister(c *gin.Context) {
	var req struct {
		Identifier   string `json:"identifier"`
		Email        string `json:"email"`
		Password     string `json:"password"`
		FirstName    string `json:"firstName"`
		LastName     string `json:"lastName"`
		BusinessName string `json:"businessName"`
		TenantID     string `json:"tenantId"`
		Phone        string `json:"phone"`
		GoogleID     string `json:"googleId"`
		CountryCode  string `json:"countryCode"`
		RegionID     string `json:"regionId"`
		CityID       string `json:"cityId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Resolve identifier
	email := req.Email
	phone := req.Phone
	if req.Identifier != "" {
		if IsPhone(req.Identifier) {
			phone = strings.ReplaceAll(strings.ReplaceAll(req.Identifier, " ", ""), "-", "")
		} else {
			email = req.Identifier
		}
	}

	if email == "" && phone == "" {
		c.JSON(400, gin.H{"error": "Email or phone is required"})
		return
	}

	// Determine auth provider
	authProvider := "email"
	if phone != "" && email == "" {
		authProvider = "phone"
	}

	// Hash password if provided
	var passwordHash *string
	if req.Password != "" {
		if len(req.Password) < 8 {
			c.JSON(400, gin.H{"error": "Password must be at least 8 characters"})
			return
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), h.Cfg.BcryptCost)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to hash password"})
			return
		}
		h := string(hash)
		passwordHash = &h
	}

	// Handle tenant: use provided TenantID or auto-create from businessName
	tenantID := req.TenantID
	if tenantID == "" {
		// Auto-create tenant
		businessName := req.BusinessName
		if businessName == "" {
			if req.FirstName != "" {
				businessName = req.FirstName + "'s Business"
			} else {
				businessName = "My Business"
			}
		}
		slug := strings.ToLower(strings.ReplaceAll(businessName, " ", "-"))
		slug = slug + "-" + uuid.New().String()[:8]

		tenantID = uuid.New().String()
		countryCode := req.CountryCode
		if countryCode == "" {
			countryCode = "SA" // Default to Saudi Arabia
		}
		_, err := h.DB.Exec(
			"INSERT INTO tenants (id, name, slug, status, plan, country_code, region_id, city_id) VALUES ($1, $2, $3, 'active', 'free', $4, NULLIF($5, '')::uuid, NULLIF($6, '')::uuid)",
			tenantID, businessName, slug, countryCode, req.RegionID, req.CityID,
		)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create tenant", "details": err.Error()})
			return
		}
	} else {
		// Verify tenant exists
		var tenantStatus string
		err := h.DB.QueryRow("SELECT status FROM tenants WHERE id = $1", tenantID).Scan(&tenantStatus)
		if err == sql.ErrNoRows {
			c.JSON(404, gin.H{"error": "Tenant not found"})
			return
		}
		if tenantStatus != "active" {
			c.JSON(403, gin.H{"error": "Tenant is not active"})
			return
		}
	}

	userID := uuid.New().String()
	role := "tenant_owner"

	var insertErr error
	if email != "" {
		insertErr = execInsert(h.DB,
			`INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, phone, role, status, auth_provider, email_verified_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, NOW())`,
			userID, tenantID, email, passwordHash, req.FirstName, req.LastName, nullIfEmpty(phone), role, authProvider,
		)
	} else {
		insertErr = execInsert(h.DB,
			`INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, phone, role, status, auth_provider)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9)`,
			userID, tenantID, email, passwordHash, req.FirstName, req.LastName, nullIfEmpty(phone), role, authProvider,
		)
	}
	if insertErr != nil {
		if strings.Contains(insertErr.Error(), "unique") {
			c.JSON(409, gin.H{"error": "Account already exists"})
			return
		}
		c.JSON(500, gin.H{"error": "Failed to create user", "details": insertErr.Error()})
		return
	}

	// Link Google OAuth account if googleId was provided (user registered via Google)
	if req.GoogleID != "" {
		authProvider = "google"
		h.DB.Exec("UPDATE users SET auth_provider = 'google' WHERE id = $1", userID)
		h.DB.Exec(
			`INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, provider_email, created_at)
			 VALUES ($1, $2, 'google', $3, $4, NOW())
			 ON CONFLICT (provider, provider_user_id) DO NOTHING`,
			uuid.New().String(), userID, req.GoogleID, email,
		)
	}

	accessToken, refreshToken, _ := model.GenerateTokens(
		h.Cfg.JWTSecret, userID, tenantID, email, role, "",
		h.Cfg.JWTAccessTTL, h.Cfg.JWTRefreshTTL,
	)

	// Use phone as identifier when no email (for consistency with login endpoints)
	userIdentifier := email
	if userIdentifier == "" {
		userIdentifier = phone
	}

	c.JSON(201, gin.H{
		"user": gin.H{
			"id": userID, "email": userIdentifier, "phone": phone,
			"firstName": req.FirstName, "lastName": req.LastName,
			"role": role, "tenantId": tenantID,
		},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

// POST /api/v1/auth/login
func (h *AuthHandler) HandleLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var id, tenantID, firstName, lastName, role, status, email string
	var passwordHash sql.NullString
	err := h.DB.QueryRow(
		`SELECT id, tenant_id, password_hash, first_name, last_name, role, status, COALESCE(email, '') FROM users WHERE email = $1 OR phone = $1`,
		req.Email,
	).Scan(&id, &tenantID, &passwordHash, &firstName, &lastName, &role, &status, &email)

	if err == sql.ErrNoRows {
		c.JSON(401, gin.H{"error": "Invalid email or password"})
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
	if !passwordHash.Valid {
		c.JSON(401, gin.H{"error": "This account uses a different sign-in method"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash.String), []byte(req.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Invalid email or password"})
		return
	}

	// Update last login
	h.DB.Exec("UPDATE users SET last_login_at = NOW() WHERE id = $1", id)

	// Create session
	sessionID := uuid.New().String()
	refreshTokenHash, _ := bcrypt.GenerateFromPassword([]byte(sessionID), bcrypt.MinCost)
	h.DB.Exec(
		`INSERT INTO sessions (id, user_id, tenant_id, refresh_token_hash, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')`,
		sessionID, id, tenantID, string(refreshTokenHash), c.GetHeader("User-Agent"), c.ClientIP(),
	)

	// Use resolved email from DB (or the request identifier for phone users)
	userIdentifier := email
	if userIdentifier == "" {
		userIdentifier = req.Email // phone number was sent in the email field
	}

	accessToken, refreshToken, _ := model.GenerateTokens(
		h.Cfg.JWTSecret, id, tenantID, userIdentifier, role, sessionID,
		h.Cfg.JWTAccessTTL, h.Cfg.JWTRefreshTTL,
	)

	c.JSON(200, gin.H{
		"user": gin.H{
			"id": id, "email": userIdentifier,
			"firstName": firstName, "lastName": lastName,
			"role": role, "tenantId": tenantID,
		},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

// POST /api/v1/auth/otp-login — Dev-only: login phone user with dummy OTP code
func (h *AuthHandler) HandleOTPLogin(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
		Code  string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Dev-only: accept dummy OTP code "1234"
	if req.Code != "1234" {
		c.JSON(401, gin.H{"error": "Invalid OTP code"})
		return
	}

	cleaned := strings.ReplaceAll(strings.ReplaceAll(req.Phone, " ", ""), "-", "")
	var id, tenantID, firstName, lastName, role, status, email string
	err := h.DB.QueryRow(
		`SELECT id, tenant_id, first_name, last_name, role, status, COALESCE(email, '') FROM users WHERE phone = $1 AND status = 'active'`,
		cleaned,
	).Scan(&id, &tenantID, &firstName, &lastName, &role, &status, &email)

	if err == sql.ErrNoRows {
		c.JSON(401, gin.H{"error": "User not found"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	userIdentifier := email
	if userIdentifier == "" {
		userIdentifier = cleaned
	}

	h.DB.Exec("UPDATE users SET last_login_at = NOW() WHERE id = $1", id)

	sessionID := uuid.New().String()
	refreshTokenHash, _ := bcrypt.GenerateFromPassword([]byte(sessionID), bcrypt.MinCost)
	h.DB.Exec(
		`INSERT INTO sessions (id, user_id, tenant_id, refresh_token_hash, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')`,
		sessionID, id, tenantID, string(refreshTokenHash), c.GetHeader("User-Agent"), c.ClientIP(),
	)

	accessToken, refreshToken, _ := model.GenerateTokens(
		h.Cfg.JWTSecret, id, tenantID, userIdentifier, role, sessionID,
		h.Cfg.JWTAccessTTL, h.Cfg.JWTRefreshTTL,
	)

	c.JSON(200, gin.H{
		"user": gin.H{
			"id": id, "email": userIdentifier,
			"firstName": firstName, "lastName": lastName,
			"role": role, "tenantId": tenantID,
		},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

// POST /api/v1/auth/logout
func (h *AuthHandler) HandleLogout(c *gin.Context) {
	claims, exists := c.Get("claims")
	if exists {
		if cl, ok := claims.(*model.Claims); ok && cl.SessionID != "" {
			h.DB.Exec("UPDATE sessions SET revoked_at = NOW() WHERE id = $1", cl.SessionID)
		}
	}
	c.JSON(200, gin.H{"message": "Logged out successfully"})
}

// POST /api/v1/auth/refresh
func (h *AuthHandler) HandleRefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	claims, err := model.ParseToken(req.RefreshToken, h.Cfg.JWTSecret)
	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid refresh token"})
		return
	}

	// Verify session is not revoked
	if claims.SessionID != "" {
		var revokedAt sql.NullTime
		err := h.DB.QueryRow("SELECT revoked_at FROM sessions WHERE id = $1", claims.SessionID).Scan(&revokedAt)
		if err != nil || revokedAt.Valid {
			c.JSON(401, gin.H{"error": "Session has been revoked"})
			return
		}
	}

	var email, role string
	err = h.DB.QueryRow("SELECT email, role FROM users WHERE id = $1 AND status = 'active'", claims.UserID).Scan(&email, &role)
	if err != nil {
		c.JSON(401, gin.H{"error": "User not found"})
		return
	}

	accessToken, refreshToken, _ := model.GenerateTokens(
		h.Cfg.JWTSecret, claims.UserID, claims.TenantID, email, role, claims.SessionID,
		h.Cfg.JWTAccessTTL, h.Cfg.JWTRefreshTTL,
	)

	c.JSON(200, gin.H{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

func nullIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func execInsert(db *sql.DB, query string, args ...interface{}) error {
	_, err := db.Exec(query, args...)
	return err
}
