package handler

import (
	"database/sql"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TenantHandler struct {
	DB *sql.DB
}

// GET /api/v1/tenants
func (h *TenantHandler) HandleListTenants(c *gin.Context) {
	rows, err := h.DB.Query("SELECT id, name, slug, status, plan, created_at FROM tenants ORDER BY created_at DESC LIMIT 100")
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	tenants := []gin.H{}
	for rows.Next() {
		var id, name, slug, status, plan string
		var createdAt time.Time
		rows.Scan(&id, &name, &slug, &status, &plan, &createdAt)
		tenants = append(tenants, gin.H{"id": id, "name": name, "slug": slug, "status": status, "plan": plan, "createdAt": createdAt})
	}
	c.JSON(200, gin.H{"tenants": tenants, "total": len(tenants)})
}

// GET /api/v1/tenants/:id
func (h *TenantHandler) HandleGetTenant(c *gin.Context) {
	id := c.Param("id")
	var name, slug, status, plan string
	var createdAt time.Time
	err := h.DB.QueryRow("SELECT name, slug, status, plan, created_at FROM tenants WHERE id = $1", id).
		Scan(&name, &slug, &status, &plan, &createdAt)
	if err != nil {
		c.JSON(404, gin.H{"error": "Tenant not found"})
		return
	}

	rows, _ := h.DB.Query("SELECT product_id, status FROM tenant_products WHERE tenant_id = $1", id)
	defer rows.Close()
	products := []gin.H{}
	for rows.Next() {
		var pid, ps string
		rows.Scan(&pid, &ps)
		products = append(products, gin.H{"productId": pid, "status": ps})
	}

	c.JSON(200, gin.H{"id": id, "name": name, "slug": slug, "status": status, "plan": plan, "createdAt": createdAt, "products": products})
}

// POST /api/v1/tenants
func (h *TenantHandler) HandleCreateTenant(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
		Slug string `json:"slug" binding:"required"`
		Plan string `json:"plan"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.Plan == "" {
		req.Plan = "free"
	}
	id := uuid.New().String()
	_, err := h.DB.Exec("INSERT INTO tenants (id, name, slug, status, plan) VALUES ($1,$2,$3,'active',$4)",
		id, req.Name, req.Slug, req.Plan)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(409, gin.H{"error": "Slug already taken"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "name": req.Name, "slug": req.Slug, "plan": req.Plan, "status": "active"})
}
