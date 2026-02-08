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
		port = "4050"
	}

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "time-attendance"})
	})

	v1 := router.Group("/api/v1/attendance")
	{
		v1.POST("/clock-in", clockIn)
		v1.POST("/clock-out", clockOut)
		v1.GET("/records", listRecords)
		v1.GET("/records/:userId/today", getTodayRecord)
		v1.GET("/reports/daily", getDailyReport)
		v1.GET("/reports/payroll-summary", getPayrollSummary)

		// Fingerprint device endpoints
		v1.POST("/devices/register", registerDevice)
		v1.POST("/devices/:id/sync", syncDevice)
		v1.GET("/devices", listDevices)
	}

	log.Printf("Time-Attendance service listening on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}

func clockIn(c *gin.Context)          { c.JSON(200, gin.H{"status": "clocked_in"}) }
func clockOut(c *gin.Context)         { c.JSON(200, gin.H{"status": "clocked_out"}) }
func listRecords(c *gin.Context)      { c.JSON(200, gin.H{"records": []any{}}) }
func getTodayRecord(c *gin.Context)   { c.JSON(200, gin.H{"userId": c.Param("userId")}) }
func getDailyReport(c *gin.Context)   { c.JSON(200, gin.H{"report": []any{}}) }
func getPayrollSummary(c *gin.Context){ c.JSON(200, gin.H{"summary": []any{}}) }
func registerDevice(c *gin.Context)   { c.JSON(201, gin.H{"deviceId": "new"}) }
func syncDevice(c *gin.Context)       { c.JSON(200, gin.H{"synced": true}) }
func listDevices(c *gin.Context)      { c.JSON(200, gin.H{"devices": []any{}}) }
