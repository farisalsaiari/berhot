package handler

import (
	"database/sql"
	"encoding/json"
	"sync"
	"time"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
)

type PasskeyHandler struct {
	DB       *sql.DB
	Cfg      *config.Config
	WebAuthn *webauthn.WebAuthn

	// In-memory session store for WebAuthn ceremonies (short-lived)
	sessions   map[string]*webauthn.SessionData
	sessionsMu sync.RWMutex
}

func NewPasskeyHandler(db *sql.DB, cfg *config.Config) (*PasskeyHandler, error) {
	wconfig := &webauthn.Config{
		RPDisplayName: cfg.WebAuthnRPDisplayName,
		RPID:          cfg.WebAuthnRPID,
		RPOrigins:     cfg.WebAuthnRPOrigins,
	}
	w, err := webauthn.New(wconfig)
	if err != nil {
		return nil, err
	}
	return &PasskeyHandler{
		DB:       db,
		Cfg:      cfg,
		WebAuthn: w,
		sessions: make(map[string]*webauthn.SessionData),
	}, nil
}

func (h *PasskeyHandler) storeSession(key string, sd *webauthn.SessionData) {
	h.sessionsMu.Lock()
	defer h.sessionsMu.Unlock()
	h.sessions[key] = sd

	// Clean up after 5 minutes
	go func() {
		time.Sleep(5 * time.Minute)
		h.sessionsMu.Lock()
		delete(h.sessions, key)
		h.sessionsMu.Unlock()
	}()
}

func (h *PasskeyHandler) getSession(key string) *webauthn.SessionData {
	h.sessionsMu.RLock()
	defer h.sessionsMu.RUnlock()
	return h.sessions[key]
}

func (h *PasskeyHandler) deleteSession(key string) {
	h.sessionsMu.Lock()
	defer h.sessionsMu.Unlock()
	delete(h.sessions, key)
}

// loadWebAuthnUser builds a WebAuthnUser from DB for the given user ID.
func (h *PasskeyHandler) loadWebAuthnUser(userID string) (*model.WebAuthnUser, error) {
	var email, firstName, lastName string
	err := h.DB.QueryRow(
		"SELECT email, first_name, last_name FROM users WHERE id = $1 AND status = 'active'",
		userID,
	).Scan(&email, &firstName, &lastName)
	if err != nil {
		return nil, err
	}

	// Load credentials
	rows, err := h.DB.Query(
		`SELECT id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, friendly_name, created_at, last_used_at
		 FROM webauthn_credentials WHERE user_id = $1`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var creds []webauthn.Credential
	for rows.Next() {
		var c model.WebAuthnCredential
		var transportsJSON []byte
		var lastUsed sql.NullTime
		err := rows.Scan(&c.ID, &c.CredentialID, &c.PublicKey, &c.AttestationType, &c.AAGUID, &c.SignCount, &transportsJSON, &c.FriendlyName, &c.CreatedAt, &lastUsed)
		if err != nil {
			continue
		}
		creds = append(creds, c.ToWebAuthnCredential())
	}

	return &model.WebAuthnUser{
		ID:          []byte(userID),
		Name:        email,
		DisplayName: firstName + " " + lastName,
		Credentials: creds,
	}, nil
}

// ── Registration (requires authenticated user) ──────────────

// POST /api/v1/auth/passkey/register/begin
func (h *PasskeyHandler) HandleRegisterBegin(c *gin.Context) {
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(401, gin.H{"error": "Authentication required"})
		return
	}
	cl := claims.(*model.Claims)

	user, err := h.loadWebAuthnUser(cl.UserID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to load user"})
		return
	}

	options, session, err := h.WebAuthn.BeginRegistration(user)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to begin registration", "details": err.Error()})
		return
	}

	// Store session keyed by userID
	h.storeSession("reg:"+cl.UserID, session)

	c.JSON(200, options)
}

// POST /api/v1/auth/passkey/register/finish
func (h *PasskeyHandler) HandleRegisterFinish(c *gin.Context) {
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(401, gin.H{"error": "Authentication required"})
		return
	}
	cl := claims.(*model.Claims)

	session := h.getSession("reg:" + cl.UserID)
	if session == nil {
		c.JSON(400, gin.H{"error": "No registration session found. Please start again."})
		return
	}

	user, err := h.loadWebAuthnUser(cl.UserID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to load user"})
		return
	}

	credential, err := h.WebAuthn.FinishRegistration(user, *session, c.Request)
	if err != nil {
		c.JSON(400, gin.H{"error": "Registration failed", "details": err.Error()})
		return
	}

	h.deleteSession("reg:" + cl.UserID)

	// Store credential in DB
	transports := make([]string, len(credential.Transport))
	for i, t := range credential.Transport {
		transports[i] = string(t)
	}
	transportsJSON, _ := json.Marshal(transports)

	_, err = h.DB.Exec(
		`INSERT INTO webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, friendly_name)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		uuid.New().String(), cl.UserID, credential.ID, credential.PublicKey,
		credential.AttestationType, credential.Authenticator.AAGUID,
		credential.Authenticator.SignCount, string(transportsJSON), "Passkey",
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to store credential"})
		return
	}

	c.JSON(200, gin.H{"status": "ok", "message": "Passkey registered successfully"})
}

// ── Authentication (no auth required) ───────────────────────

// POST /api/v1/auth/passkey/login/begin
func (h *PasskeyHandler) HandleLoginBegin(c *gin.Context) {
	// Discoverable credential flow: no user identifier needed
	options, session, err := h.WebAuthn.BeginDiscoverableLogin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to begin passkey login", "details": err.Error()})
		return
	}

	// Generate a session key and return it to the client
	sessionKey := uuid.New().String()
	h.storeSession("login:"+sessionKey, session)

	c.JSON(200, gin.H{
		"publicKey":  options.Response,
		"sessionKey": sessionKey,
	})
}

// POST /api/v1/auth/passkey/login/finish?sessionKey=...
func (h *PasskeyHandler) HandleLoginFinish(c *gin.Context) {
	// Session key MUST come from query param — body is the WebAuthn credential response
	sessionKey := c.Query("sessionKey")
	if sessionKey == "" {
		c.JSON(400, gin.H{"error": "Missing sessionKey query parameter"})
		return
	}

	session := h.getSession("login:" + sessionKey)
	if session == nil {
		c.JSON(400, gin.H{"error": "No login session found. Please start again."})
		return
	}

	// Discoverable login handler: finds the user by credential
	var foundUserID string
	handler := func(rawID, userHandle []byte) (webauthn.User, error) {
		userID := string(userHandle)
		foundUserID = userID
		return h.loadWebAuthnUser(userID)
	}

	credential, err := h.WebAuthn.FinishDiscoverableLogin(handler, *session, c.Request)
	if err != nil {
		c.JSON(401, gin.H{"error": "Passkey authentication failed", "details": err.Error()})
		return
	}

	h.deleteSession("login:" + sessionKey)

	// Update sign count and last_used_at
	h.DB.Exec(
		"UPDATE webauthn_credentials SET sign_count = $1, last_used_at = NOW() WHERE credential_id = $2",
		credential.Authenticator.SignCount, credential.ID,
	)

	// Get user details for token generation
	var tenantID, email, role string
	err = h.DB.QueryRow(
		"SELECT tenant_id, email, role FROM users WHERE id = $1 AND status = 'active'",
		foundUserID,
	).Scan(&tenantID, &email, &role)
	if err != nil {
		c.JSON(500, gin.H{"error": "User not found"})
		return
	}

	// Update last login
	h.DB.Exec("UPDATE users SET last_login_at = NOW() WHERE id = $1", foundUserID)

	// Create session
	sessionID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO sessions (id, user_id, tenant_id, refresh_token_hash, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, 'passkey', $4, $5, NOW() + INTERVAL '7 days')`,
		sessionID, foundUserID, tenantID, c.GetHeader("User-Agent"), c.ClientIP(),
	)

	// Generate tokens
	accessToken, refreshToken, _ := model.GenerateTokens(
		h.Cfg.JWTSecret, foundUserID, tenantID, email, role, sessionID,
		h.Cfg.JWTAccessTTL, h.Cfg.JWTRefreshTTL,
	)

	// Get user info for response
	var firstName, lastName string
	h.DB.QueryRow("SELECT first_name, last_name FROM users WHERE id = $1", foundUserID).Scan(&firstName, &lastName)

	c.JSON(200, gin.H{
		"user": gin.H{
			"id": foundUserID, "email": email,
			"firstName": firstName, "lastName": lastName,
			"role": role, "tenantId": tenantID,
		},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    h.Cfg.JWTAccessTTL,
	})
}
