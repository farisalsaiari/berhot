package handler

import (
	"database/sql"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/berhot/platform/identity-access/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type OTPHandler struct {
	DB     *sql.DB
	Cfg    *config.Config
	Sender service.OTPSender
}

// POST /api/v1/auth/otp/send
func (h *OTPHandler) HandleSendOTP(c *gin.Context) {
	var req struct {
		Identifier string `json:"identifier" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	identifier := req.Identifier

	// Rate limit: max 3 OTPs per identifier per 10 minutes
	var recentCount int
	h.DB.QueryRow(
		"SELECT COUNT(*) FROM otp_codes WHERE identifier = $1 AND created_at > NOW() - INTERVAL '10 minutes'",
		identifier,
	).Scan(&recentCount)

	if recentCount >= 3 {
		c.JSON(429, gin.H{"error": "Too many OTP requests. Try again later."})
		return
	}

	// Generate 6-digit code
	code := service.GenerateOTPCode()

	// Hash and store
	codeHash, err := bcrypt.GenerateFromPassword([]byte(code), bcrypt.MinCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Internal error"})
		return
	}

	otpID := uuid.New().String()
	_, err = h.DB.Exec(
		`INSERT INTO otp_codes (id, identifier, code_hash, purpose, expires_at)
		 VALUES ($1, $2, $3, 'login', NOW() + INTERVAL '5 minutes')`,
		otpID, identifier, string(codeHash),
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create OTP"})
		return
	}

	// Send OTP
	if err := h.Sender.Send(c.Request.Context(), identifier, code); err != nil {
		c.JSON(500, gin.H{"error": "Failed to send OTP"})
		return
	}

	// Mask destination
	masked := identifier
	if len(identifier) > 4 {
		if IsPhone(identifier) {
			masked = "****" + identifier[len(identifier)-4:]
		} else if IsEmail(identifier) {
			parts := splitEmail(identifier)
			if len(parts[0]) > 2 {
				masked = parts[0][:2] + "***@" + parts[1]
			}
		}
	}

	c.JSON(200, gin.H{
		"sent":        true,
		"destination": masked,
		"expiresIn":   300,
	})
}

// POST /api/v1/auth/otp/verify
func (h *OTPHandler) HandleVerifyOTP(c *gin.Context) {
	var req struct {
		Identifier string `json:"identifier" binding:"required"`
		Code       string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Find latest unexpired, unverified OTP
	var otpID, codeHash string
	var attempts, maxAttempts int
	err := h.DB.QueryRow(
		`SELECT id, code_hash, attempts, max_attempts FROM otp_codes
		 WHERE identifier = $1 AND purpose = 'login' AND verified_at IS NULL AND expires_at > NOW()
		 ORDER BY created_at DESC LIMIT 1`,
		req.Identifier,
	).Scan(&otpID, &codeHash, &attempts, &maxAttempts)

	if err == sql.ErrNoRows {
		c.JSON(400, gin.H{"error": "No valid OTP found. Request a new one."})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	if attempts >= maxAttempts {
		c.JSON(400, gin.H{"error": "Too many attempts. Request a new OTP."})
		return
	}

	// Increment attempts
	h.DB.Exec("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", otpID)

	// Verify code
	if err := bcrypt.CompareHashAndPassword([]byte(codeHash), []byte(req.Code)); err != nil {
		remaining := maxAttempts - attempts - 1
		c.JSON(400, gin.H{"error": "Invalid code", "remainingAttempts": remaining})
		return
	}

	// Mark as verified
	h.DB.Exec("UPDATE otp_codes SET verified_at = NOW() WHERE id = $1", otpID)

	// Find or create user
	var userID, tenantID, email, firstName, lastName, role string
	isPhone := IsPhone(req.Identifier)

	if isPhone {
		err = h.DB.QueryRow(
			"SELECT id, tenant_id, COALESCE(email,''), first_name, last_name, role FROM users WHERE phone = $1 AND status = 'active'",
			req.Identifier,
		).Scan(&userID, &tenantID, &email, &firstName, &lastName, &role)
	} else {
		err = h.DB.QueryRow(
			"SELECT id, tenant_id, email, first_name, last_name, role FROM users WHERE email = $1 AND status = 'active'",
			req.Identifier,
		).Scan(&userID, &tenantID, &email, &firstName, &lastName, &role)
	}

	if err == sql.ErrNoRows {
		// User doesn't exist yet — return a flag to prompt registration
		c.JSON(200, gin.H{
			"verified":       true,
			"userExists":     false,
			"identifier":     req.Identifier,
			"needsRegistration": true,
		})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	// Update last login and phone verification
	h.DB.Exec("UPDATE users SET last_login_at = NOW(), phone_verified_at = COALESCE(phone_verified_at, NOW()) WHERE id = $1", userID)

	// Create session
	sessionID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO sessions (id, user_id, tenant_id, refresh_token_hash, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')`,
		sessionID, userID, tenantID, "otp-session", c.GetHeader("User-Agent"), c.ClientIP(),
	)

	accessToken, refreshToken, _ := model.GenerateTokens(
		h.Cfg.JWTSecret, userID, tenantID, email, role, sessionID,
		h.Cfg.JWTAccessTTL, h.Cfg.JWTRefreshTTL,
	)

	c.JSON(200, gin.H{
		"verified":   true,
		"userExists": true,
		"user": gin.H{
			"id": userID, "email": email,
			"firstName": firstName, "lastName": lastName,
			"role": role, "tenantId": tenantID,
		},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}

func splitEmail(email string) [2]string {
	for i, c := range email {
		if c == '@' {
			return [2]string{email[:i], email[i+1:]}
		}
	}
	return [2]string{email, ""}
}
