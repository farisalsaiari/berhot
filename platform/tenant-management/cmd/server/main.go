package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "tenant-management"})
	})

	v1 := router.Group("/api/v1/tenants")
	{
		v1.POST("/", createTenant)
		v1.GET("/", listTenants)
		v1.GET("/:id", getTenant)
		v1.PUT("/:id", updateTenant)
		v1.PUT("/:id/status", updateTenantStatus)
		v1.DELETE("/:id", deleteTenant)

		// Product entitlements
		v1.GET("/:id/products", getTenantProducts)
		v1.POST("/:id/products", activateProduct)
		v1.DELETE("/:id/products/:productId", deactivateProduct)

		// Settings
		v1.GET("/:id/settings", getTenantSettings)
		v1.PUT("/:id/settings", updateTenantSettings)

		// Onboarding
		v1.POST("/onboard", onboardTenant)
		v1.GET("/:id/onboarding-status", getOnboardingStatus)
	}

	// Internal
	internal := router.Group("/internal")
	{
		internal.GET("/tenants/:id", internalGetTenant)
		internal.GET("/tenants/:id/entitlements", checkEntitlements)
	}

	log.Printf("Tenant-Management listening on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}

func createTenant(c *gin.Context)       { c.JSON(201, gin.H{"id": "new"}) }
func listTenants(c *gin.Context)        { c.JSON(200, gin.H{"tenants": []any{}, "total": 0}) }
func getTenant(c *gin.Context)          { c.JSON(200, gin.H{"id": c.Param("id")}) }
func updateTenant(c *gin.Context)       { c.JSON(200, gin.H{"updated": true}) }
func updateTenantStatus(c *gin.Context) { c.JSON(200, gin.H{"status": "updated"}) }
func deleteTenant(c *gin.Context)       { c.JSON(200, gin.H{"deleted": true}) }
func getTenantProducts(c *gin.Context)  { c.JSON(200, gin.H{"products": []any{}}) }
func activateProduct(c *gin.Context)    { c.JSON(201, gin.H{"activated": true}) }
func deactivateProduct(c *gin.Context)  { c.JSON(200, gin.H{"deactivated": true}) }
func getTenantSettings(c *gin.Context)  { c.JSON(200, gin.H{"settings": map[string]any{}}) }
func updateTenantSettings(c *gin.Context) { c.JSON(200, gin.H{"updated": true}) }
func onboardTenant(c *gin.Context)      { c.JSON(201, gin.H{"tenantId": "new", "status": "onboarding"}) }
func getOnboardingStatus(c *gin.Context){ c.JSON(200, gin.H{"status": "complete"}) }
func internalGetTenant(c *gin.Context)  { c.JSON(200, gin.H{"id": c.Param("id"), "status": "active"}) }
func checkEntitlements(c *gin.Context)  { c.JSON(200, gin.H{"entitled": true}) }
