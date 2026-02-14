package handler

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

// Allowed image extensions
var allowedExts = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".svg": true, ".webp": true,
}

// Max file size: 5 MB
const maxUploadSize = 5 << 20

// POST /api/v1/tenants/me/logo — upload tenant logo
func (h *UploadHandler) HandleUploadLogo(c *gin.Context) {
	h.handleImageUpload(c, "logo", "logo_url", "logos")
}

// POST /api/v1/tenants/me/cover — upload tenant cover image
func (h *UploadHandler) HandleUploadCover(c *gin.Context) {
	h.handleImageUpload(c, "cover", "cover_url", "covers")
}

func (h *UploadHandler) handleImageUpload(c *gin.Context, fieldName string, dbColumn string, assetDir string) {
	tenantID := c.GetString("tenantId")
	if tenantID == "" {
		c.JSON(401, gin.H{"error": "No tenant in token"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Validate file size
	if header.Size > maxUploadSize {
		c.JSON(400, gin.H{"error": "File too large. Maximum size is 5MB"})
		return
	}

	// Validate extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExts[ext] {
		c.JSON(400, gin.H{"error": "Invalid file type. Allowed: jpg, jpeg, png, svg, webp"})
		return
	}

	// Production folder structure: uploads/tenants/{tenantID}/{assetType}/{filename}
	// e.g. uploads/tenants/abc-123/logos/logo_f8e2a1b3.png
	//      uploads/tenants/abc-123/covers/cover_d4c7e9f1.jpg
	//      uploads/tenants/abc-123/products/product_a1b2c3d4.webp
	uploadsDir := filepath.Join("uploads", "tenants", tenantID, assetDir)
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		c.JSON(500, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Delete old file if exists
	var oldURL sql.NullString
	_ = h.DB.QueryRow(fmt.Sprintf("SELECT %s FROM tenants WHERE id = $1", dbColumn), tenantID).Scan(&oldURL)
	if oldURL.Valid && oldURL.String != "" {
		// Strip leading slash for filesystem path (DB stores /uploads/... but disk is uploads/...)
		oldPath := strings.TrimPrefix(oldURL.String, "/")
		os.Remove(oldPath)
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s_%s%s", fieldName, uuid.New().String()[:8], ext)
	savePath := filepath.Join(uploadsDir, filename)

	// Save file to disk
	if err := c.SaveUploadedFile(header, savePath); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}

	// Build the public URL path
	publicURL := "/uploads/tenants/" + tenantID + "/" + assetDir + "/" + filename

	// Update database
	_, err = h.DB.Exec(
		fmt.Sprintf("UPDATE tenants SET %s = $1, updated_at = NOW() WHERE id = $2", dbColumn),
		publicURL, tenantID,
	)
	if err != nil {
		os.Remove(savePath)
		c.JSON(500, gin.H{"error": "Failed to update database"})
		return
	}

	c.JSON(200, gin.H{
		"message": fieldName + " uploaded successfully",
		"url":     publicURL,
	})
}
