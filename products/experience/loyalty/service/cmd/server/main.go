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
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "loyalty"})
	})

	v1 := router.Group("/api/v1/loyalty")
	{
		// Programs
		v1.GET("/programs", listPrograms)
		v1.POST("/programs", createProgram)
		v1.GET("/programs/:id", getProgram)
		v1.PUT("/programs/:id", updateProgram)

		// Members
		v1.POST("/members", enrollMember)
		v1.GET("/members/:customerId", getMemberProfile)
		v1.GET("/members/:customerId/balance", getMemberBalance)
		v1.GET("/members/:customerId/transactions", getMemberTransactions)

		// Points
		v1.POST("/points/earn", earnPoints)
		v1.POST("/points/redeem", redeemPoints)
		v1.POST("/points/adjust", adjustPoints)

		// Rewards
		v1.GET("/rewards", listRewards)
		v1.POST("/rewards", createReward)
		v1.POST("/rewards/:id/claim", claimReward)

		// Tiers
		v1.GET("/tiers", listTiers)
		v1.POST("/tiers", createTier)

		// Public API (for external POS integrations)
		pub := v1.Group("/public")
		{
			pub.GET("/check", publicCheckBalance)
			pub.POST("/earn", publicEarnPoints)
			pub.POST("/redeem", publicRedeemPoints)
		}
	}

	log.Printf("Loyalty service listening on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}

// Stub handlers
func listPrograms(c *gin.Context)         { c.JSON(200, gin.H{"programs": []any{}}) }
func createProgram(c *gin.Context)        { c.JSON(201, gin.H{"id": "new"}) }
func getProgram(c *gin.Context)           { c.JSON(200, gin.H{"id": c.Param("id")}) }
func updateProgram(c *gin.Context)        { c.JSON(200, gin.H{"message": "updated"}) }
func enrollMember(c *gin.Context)         { c.JSON(201, gin.H{"message": "enrolled"}) }
func getMemberProfile(c *gin.Context)     { c.JSON(200, gin.H{"customerId": c.Param("customerId")}) }
func getMemberBalance(c *gin.Context)     { c.JSON(200, gin.H{"points": 0, "tier": "bronze"}) }
func getMemberTransactions(c *gin.Context){ c.JSON(200, gin.H{"transactions": []any{}}) }
func earnPoints(c *gin.Context)           { c.JSON(200, gin.H{"points": 10, "balance": 10}) }
func redeemPoints(c *gin.Context)         { c.JSON(200, gin.H{"redeemed": 10}) }
func adjustPoints(c *gin.Context)         { c.JSON(200, gin.H{"adjusted": true}) }
func listRewards(c *gin.Context)          { c.JSON(200, gin.H{"rewards": []any{}}) }
func createReward(c *gin.Context)         { c.JSON(201, gin.H{"id": "new"}) }
func claimReward(c *gin.Context)          { c.JSON(200, gin.H{"claimed": true}) }
func listTiers(c *gin.Context)            { c.JSON(200, gin.H{"tiers": []any{}}) }
func createTier(c *gin.Context)           { c.JSON(201, gin.H{"id": "new"}) }
func publicCheckBalance(c *gin.Context)   { c.JSON(200, gin.H{"points": 0}) }
func publicEarnPoints(c *gin.Context)     { c.JSON(200, gin.H{"earned": true}) }
func publicRedeemPoints(c *gin.Context)   { c.JSON(200, gin.H{"redeemed": true}) }
