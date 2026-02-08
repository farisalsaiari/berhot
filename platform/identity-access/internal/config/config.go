package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port       string
	AppEnv     string
	DatabaseURL string
	RedisURL   string

	// JWT
	JWTSecret      []byte
	JWTAccessTTL   int // seconds
	JWTRefreshTTL  int // seconds

	// Bcrypt
	BcryptCost int

	// CORS
	CORSOrigins []string

	// Google OAuth
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string

	// WebAuthn / Passkey
	WebAuthnRPDisplayName string
	WebAuthnRPID          string
	WebAuthnRPOrigins     []string

	// SMTP (OTP delivery)
	SMTPHost string
	SMTPPort string
	SMTPFrom string
}

func Load() *Config {
	return &Config{
		Port:       getEnv("APP_PORT", "8080"),
		AppEnv:     getEnv("APP_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://berhot:berhot_dev_password@localhost:5555/berhot_dev?sslmode=disable"),
		RedisURL:   getEnv("REDIS_URL", "redis://localhost:6379"),

		JWTSecret:     []byte(getEnv("JWT_SECRET", "berhot-dev-secret-change-in-prod")),
		JWTAccessTTL:  getEnvInt("JWT_ACCESS_TOKEN_TTL", 900),
		JWTRefreshTTL: getEnvInt("JWT_REFRESH_TOKEN_TTL", 604800),

		BcryptCost: getEnvInt("BCRYPT_COST", 12),

		CORSOrigins: strings.Split(getEnv("CORS_ORIGINS", "http://localhost:3000"), ","),

		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/v1/auth/oauth/google/callback"),

		WebAuthnRPDisplayName: getEnv("WEBAUTHN_RP_DISPLAY_NAME", "Berhot"),
		WebAuthnRPID:          getEnv("WEBAUTHN_RP_ID", "localhost"),
		WebAuthnRPOrigins:     strings.Split(getEnv("WEBAUTHN_RP_ORIGINS", "http://localhost:3000"), ","),

		SMTPHost: getEnv("SMTP_HOST", "localhost"),
		SMTPPort: getEnv("SMTP_PORT", "1025"),
		SMTPFrom: getEnv("SMTP_FROM", "noreply@berhot.dev"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
