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
	if port == "" { port = "8080" }
	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "hardware"})
	})
	v1 := router.Group("/api/v1/hardware")
	{
		v1.GET("/devices", func(c *gin.Context) { c.JSON(200, gin.H{"devices": []any{}}) })
		v1.POST("/devices", func(c *gin.Context) { c.JSON(201, gin.H{"id": "new"}) })
		v1.GET("/devices/:id", func(c *gin.Context) { c.JSON(200, gin.H{"id": c.Param("id")}) })
		v1.POST("/devices/:id/pair", func(c *gin.Context) { c.JSON(200, gin.H{"paired": true}) })
		v1.POST("/devices/:id/print", func(c *gin.Context) { c.JSON(200, gin.H{"printed": true}) })
		v1.POST("/devices/:id/open-drawer", func(c *gin.Context) { c.JSON(200, gin.H{"opened": true}) })
	}
	log.Printf("Hardware service listening on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}
