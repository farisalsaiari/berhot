package router

import (
	"database/sql"
	"log"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/handler"
	"github.com/berhot/platform/identity-access/internal/middleware"
	"github.com/berhot/platform/identity-access/internal/service"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, db *sql.DB, cfg *config.Config) {
	// ── Middleware ───────────────────────────────────────────
	r.Use(middleware.CORSMiddleware(cfg.CORSOrigins))

	// ── Handlers ────────────────────────────────────────────
	authH := &handler.AuthHandler{DB: db, Cfg: cfg}
	userH := &handler.UserHandler{DB: db, Cfg: cfg}
	tenantH := &handler.TenantHandler{DB: db, Cfg: cfg}
	internalH := &handler.InternalHandler{DB: db, Cfg: cfg}
	oauthH := &handler.OAuthHandler{DB: db, Cfg: cfg}
	adminH := &handler.AdminHandler{DB: db, Cfg: cfg}

	// OTP sender setup
	otpSender := &service.MultiSender{
		EmailSender: &service.MailhogSender{
			Host: cfg.SMTPHost,
			Port: cfg.SMTPPort,
			From: cfg.SMTPFrom,
		},
		PhoneSender: &service.ConsoleSender{},
	}
	otpH := &handler.OTPHandler{DB: db, Cfg: cfg, Sender: otpSender}

	// ── Health ──────────────────────────────────────────────
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "identity-access", "version": "dev"})
	})
	r.GET("/ready", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(503, gin.H{"status": "not ready", "error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"status": "ready"})
	})

	v1 := r.Group("/api/v1")

	// ── Customer Auth (public) ──────────────────────────────
	auth := v1.Group("/auth")
	{
		auth.POST("/check-user", authH.HandleCheckUser)
		auth.POST("/register", authH.HandleRegister)
		auth.POST("/login", authH.HandleLogin)
		auth.POST("/otp-login", authH.HandleOTPLogin)
		auth.POST("/refresh", authH.HandleRefreshToken)

		// OTP
		auth.POST("/otp/send", otpH.HandleSendOTP)
		auth.POST("/otp/verify", otpH.HandleVerifyOTP)

		// Google OAuth
		auth.GET("/oauth/google", oauthH.HandleGoogleRedirect)
		auth.GET("/oauth/google/callback", oauthH.HandleGoogleCallback)

		// Passkey / WebAuthn
		passkeyH, err := handler.NewPasskeyHandler(db, cfg)
		if err != nil {
			log.Printf("WARNING: WebAuthn initialization failed: %v (passkey endpoints disabled)", err)
		} else {
			auth.POST("/passkey/login/begin", passkeyH.HandleLoginBegin)
			auth.POST("/passkey/login/finish", passkeyH.HandleLoginFinish)
			auth.POST("/passkey/register/begin", middleware.AuthMiddleware(cfg.JWTSecret), passkeyH.HandleRegisterBegin)
			auth.POST("/passkey/register/finish", middleware.AuthMiddleware(cfg.JWTSecret), passkeyH.HandleRegisterFinish)
		}

		// Logout requires auth
		auth.POST("/logout", middleware.AuthMiddleware(cfg.JWTSecret), authH.HandleLogout)
	}

	// ── Admin Auth (separate tables, separate JWTs, separate middleware) ─
	adminAuth := v1.Group("/admin/auth")
	{
		adminAuth.POST("/login", adminH.HandleAdminLogin)
		adminAuth.POST("/signup", adminH.HandleAdminSignup) // Bootstrap only — disabled after first admin
		adminAuth.POST("/refresh", adminH.HandleAdminRefresh)
		adminAuth.POST("/logout", adminH.AdminAuthMiddleware(), adminH.HandleAdminLogout)

		// Protected admin endpoints (uses admin-specific auth middleware)
		adminProtected := v1.Group("/admin")
		adminProtected.Use(adminH.AdminAuthMiddleware())
		{
			adminProtected.POST("/auth/invite", adminH.HandleAdminInvite)
			adminProtected.GET("/users", adminH.HandleListAdmins)
		}
	}

	// ── Users (authenticated) ───────────────────────────────
	users := v1.Group("/users")
	users.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		users.GET("/me", userH.HandleGetCurrentUser)
		users.PUT("/me", userH.HandleUpdateCurrentUser)
		users.GET("/", userH.HandleListUsers)
		users.GET("/:id", userH.HandleGetUser)
		users.POST("/", userH.HandleCreateUser)
		users.DELETE("/:id", userH.HandleDeleteUser)
	}

	// ── Partners (public apply + admin list) ────────────────
	partnerH := &handler.PartnerHandler{DB: db, Cfg: cfg}
	partners := v1.Group("/partners")
	{
		partners.POST("/apply", partnerH.HandleApply)
	}
	// Admin-protected partner endpoints
	adminPartners := v1.Group("/admin/partners")
	adminPartners.Use(adminH.AdminAuthMiddleware())
	{
		adminPartners.GET("/applications", partnerH.HandleListApplications)
	}

	// ── Locations (public) ──────────────────────────────────
	locationH := &handler.LocationHandler{DB: db, Cfg: cfg}
	locations := v1.Group("/locations")
	{
		locations.GET("/countries", locationH.HandleListCountries)
		locations.GET("/countries/:code/regions", locationH.HandleListRegions)
		locations.GET("/regions/:id/cities", locationH.HandleListCities)
	}

	// ── Tenants (authenticated — /me routes) ────────────────
	myTenant := v1.Group("/tenants")
	myTenant.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		myTenant.GET("/me", tenantH.HandleGetMyTenant)
		myTenant.PUT("/me", tenantH.HandleUpdateMyTenant)
		myTenant.PUT("/me/plan", tenantH.HandleUpdateMyTenantPlan)
	}

	// ── Tenants (public) ────────────────────────────────────
	tenants := v1.Group("/tenants")
	{
		tenants.GET("/", tenantH.HandleListTenants)
		tenants.GET("/:id", tenantH.HandleGetTenant)
		tenants.POST("/", tenantH.HandleCreateTenant)
	}

	// ── Internal (service-to-service) ───────────────────────
	internal := r.Group("/internal")
	{
		internal.POST("/validate-token", internalH.HandleValidateToken)
		internal.GET("/users/:id", internalH.HandleInternalGetUser)
	}
}
