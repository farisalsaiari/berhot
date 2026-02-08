package middleware

import (
	"strings"

	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(401, gin.H{"error": "Missing or invalid Authorization header"})
			return
		}

		claims, err := model.ParseToken(strings.TrimPrefix(auth, "Bearer "), jwtSecret)
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token", "details": err.Error()})
			return
		}

		c.Set("claims", claims)
		c.Set("userId", claims.UserID)
		c.Set("tenantId", claims.TenantID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}
