package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OAuthHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

func (h *OAuthHandler) googleConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     h.Cfg.GoogleClientID,
		ClientSecret: h.Cfg.GoogleClientSecret,
		RedirectURL:  h.Cfg.GoogleRedirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
}

// GET /api/v1/auth/oauth/google
func (h *OAuthHandler) HandleGoogleRedirect(c *gin.Context) {
	if h.Cfg.GoogleClientID == "" {
		c.JSON(501, gin.H{"error": "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."})
		return
	}

	redirectURI := c.Query("redirect_uri")
	langCode := c.DefaultQuery("lang_code", "en")

	// Encode state with redirect info
	state := url.Values{}
	state.Set("redirect_uri", redirectURI)
	state.Set("lang_code", langCode)

	authURL := h.googleConfig().AuthCodeURL(state.Encode(), oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// GET /api/v1/auth/oauth/google/callback
func (h *OAuthHandler) HandleGoogleCallback(c *gin.Context) {
	code := c.Query("code")
	stateStr := c.Query("state")

	if code == "" {
		c.JSON(400, gin.H{"error": "Missing authorization code"})
		return
	}

	// Parse state
	state, _ := url.ParseQuery(stateStr)
	redirectURI := state.Get("redirect_uri")
	langCode := state.Get("lang_code")
	if langCode == "" {
		langCode = "en"
	}

	// Exchange code for token
	oauthToken, err := h.googleConfig().Exchange(c.Request.Context(), code)
	if err != nil {
		h.redirectWithError(c, redirectURI, "Failed to exchange authorization code")
		return
	}

	// Get user info from Google
	client := h.googleConfig().Client(c.Request.Context(), oauthToken)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		h.redirectWithError(c, redirectURI, "Failed to get user info from Google")
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var googleUser struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		VerifiedEmail bool   `json:"verified_email"`
		Name          string `json:"name"`
		GivenName     string `json:"given_name"`
		FamilyName    string `json:"family_name"`
		Picture       string `json:"picture"`
	}
	json.Unmarshal(body, &googleUser)

	// Check if OAuth account already exists
	var userID, tenantID, email, firstName, lastName, role string
	err = h.DB.QueryRow(
		`SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.role
		 FROM oauth_accounts oa JOIN users u ON oa.user_id = u.id
		 WHERE oa.provider = 'google' AND oa.provider_user_id = $1 AND u.status = 'active'`,
		googleUser.ID,
	).Scan(&userID, &tenantID, &email, &firstName, &lastName, &role)

	isNewUser := false

	if err == sql.ErrNoRows {
		// Check if user exists by email
		err = h.DB.QueryRow(
			"SELECT id, tenant_id, email, first_name, last_name, role FROM users WHERE email = $1 AND status = 'active'",
			googleUser.Email,
		).Scan(&userID, &tenantID, &email, &firstName, &lastName, &role)

		if err == sql.ErrNoRows {
			isNewUser = true
		}

		if !isNewUser {
			// Existing user found by email — link OAuth account
			h.DB.Exec(
				`INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, provider_email, access_token, refresh_token, token_expires_at, raw_profile)
				 VALUES ($1, $2, 'google', $3, $4, $5, $6, $7, $8)
				 ON CONFLICT (provider, provider_user_id) DO UPDATE SET access_token = $5, refresh_token = $6, token_expires_at = $7`,
				uuid.New().String(), userID, googleUser.ID, googleUser.Email,
				oauthToken.AccessToken, oauthToken.RefreshToken, oauthToken.Expiry, string(body),
			)
		}
	}

	// Redirect back to frontend
	if redirectURI == "" {
		redirectURI = fmt.Sprintf("http://localhost:3000/%s/signin", langCode)
	}

	// New user: redirect with Google profile for frontend registration form
	if isNewUser {
		fragment := url.Values{}
		fragment.Set("google_new_user", "true")
		fragment.Set("google_email", googleUser.Email)
		fragment.Set("google_first_name", googleUser.GivenName)
		fragment.Set("google_last_name", googleUser.FamilyName)
		fragment.Set("google_id", googleUser.ID)
		c.Redirect(http.StatusTemporaryRedirect, redirectURI+"#"+fragment.Encode())
		return
	}

	// Existing user: create session and return tokens
	h.DB.Exec("UPDATE users SET last_login_at = NOW() WHERE id = $1", userID)

	sessionID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO sessions (id, user_id, tenant_id, refresh_token_hash, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, 'google-oauth', $4, $5, NOW() + INTERVAL '7 days')`,
		sessionID, userID, tenantID, c.GetHeader("User-Agent"), c.ClientIP(),
	)

	accessToken, refreshToken, _ := model.GenerateTokens(
		h.Cfg.JWTSecret, userID, tenantID, email, role, sessionID,
		h.Cfg.JWTAccessTTL, h.Cfg.JWTRefreshTTL,
	)

	fragment := url.Values{}
	fragment.Set("access_token", accessToken)
	fragment.Set("refresh_token", refreshToken)
	fragment.Set("expires_in", fmt.Sprintf("%d", h.Cfg.JWTAccessTTL))

	c.Redirect(http.StatusTemporaryRedirect, redirectURI+"#"+fragment.Encode())
}

func (h *OAuthHandler) redirectWithError(c *gin.Context, redirectURI, errMsg string) {
	if redirectURI == "" {
		c.JSON(500, gin.H{"error": errMsg})
		return
	}
	fragment := url.Values{}
	fragment.Set("error", errMsg)
	c.Redirect(http.StatusTemporaryRedirect, redirectURI+"#"+fragment.Encode())
}
