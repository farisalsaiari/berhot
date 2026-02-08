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
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "queue-waitlist"})
	})

	v1 := router.Group("/api/v1/queue")
	{
		// Queue management
		v1.GET("/queues", listQueues)
		v1.POST("/queues", createQueue)
		v1.GET("/queues/:id", getQueue)
		v1.GET("/queues/:id/status", getQueueStatus)

		// Queue entries
		v1.POST("/entries", joinQueue)
		v1.GET("/entries/:id", getEntry)
		v1.PUT("/entries/:id/notify", notifyCustomer)
		v1.PUT("/entries/:id/serve", markAsServing)
		v1.PUT("/entries/:id/complete", markAsServed)
		v1.PUT("/entries/:id/cancel", cancelEntry)
		v1.GET("/entries/:id/position", getPosition)

		// WebSocket for real-time updates
		v1.GET("/ws/:queueId", handleWebSocket)

		// Public API (customer self-service)
		pub := v1.Group("/public")
		{
			pub.POST("/join", publicJoinQueue)
			pub.GET("/status/:entryId", publicCheckStatus)
			pub.DELETE("/cancel/:entryId", publicCancelEntry)
		}
	}

	log.Printf("Queue-Waitlist service listening on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}

func listQueues(c *gin.Context)      { c.JSON(200, gin.H{"queues": []any{}}) }
func createQueue(c *gin.Context)     { c.JSON(201, gin.H{"id": "new"}) }
func getQueue(c *gin.Context)        { c.JSON(200, gin.H{"id": c.Param("id")}) }
func getQueueStatus(c *gin.Context)  { c.JSON(200, gin.H{"waiting": 0, "avgWait": 0}) }
func joinQueue(c *gin.Context)       { c.JSON(201, gin.H{"entryId": "new", "position": 1}) }
func getEntry(c *gin.Context)        { c.JSON(200, gin.H{"id": c.Param("id")}) }
func notifyCustomer(c *gin.Context)  { c.JSON(200, gin.H{"notified": true}) }
func markAsServing(c *gin.Context)   { c.JSON(200, gin.H{"status": "serving"}) }
func markAsServed(c *gin.Context)    { c.JSON(200, gin.H{"status": "served"}) }
func cancelEntry(c *gin.Context)     { c.JSON(200, gin.H{"status": "cancelled"}) }
func getPosition(c *gin.Context)     { c.JSON(200, gin.H{"position": 1}) }
func handleWebSocket(c *gin.Context) { c.JSON(200, gin.H{"ws": "upgrade"}) }
func publicJoinQueue(c *gin.Context) { c.JSON(201, gin.H{"entryId": "public"}) }
func publicCheckStatus(c *gin.Context) { c.JSON(200, gin.H{"position": 1}) }
func publicCancelEntry(c *gin.Context) { c.JSON(200, gin.H{"cancelled": true}) }
