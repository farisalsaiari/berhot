package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8082"
	}

	dbURL := getEnv("DATABASE_URL", "postgres://berhot:berhot_dev_password@localhost:5555/berhot_dev?sslmode=disable")
	var err error
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}
	defer db.Close()
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	if err := db.Ping(); err != nil {
		log.Fatalf("DB ping failed: %v", err)
	}
	log.Println("POS Engine connected to database")

	// Auto-migrate: ensure tables and columns exist
	db.Exec(`CREATE TABLE IF NOT EXISTS app_settings (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		tenant_id UUID NOT NULL UNIQUE,
		banner_enabled BOOLEAN NOT NULL DEFAULT false,
		banner_mode TEXT NOT NULL DEFAULT 'single',
		auto_slide_interval INTEGER NOT NULL DEFAULT 5,
		updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	db.Exec(`CREATE TABLE IF NOT EXISTS app_banners (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		tenant_id UUID NOT NULL,
		image_url TEXT NOT NULL DEFAULT '',
		link_url TEXT NOT NULL DEFAULT '',
		link_type TEXT NOT NULL DEFAULT 'external',
		title TEXT NOT NULL DEFAULT '',
		description TEXT NOT NULL DEFAULT '',
		sort_order INTEGER NOT NULL DEFAULT 0,
		is_active BOOLEAN NOT NULL DEFAULT true,
		show_overlay BOOLEAN NOT NULL DEFAULT false,
		overlay_title TEXT NOT NULL DEFAULT '',
		overlay_description TEXT NOT NULL DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS show_overlay BOOLEAN NOT NULL DEFAULT false`)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS overlay_title TEXT NOT NULL DEFAULT ''`)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS overlay_description TEXT NOT NULL DEFAULT ''`)
	log.Println("POS Engine: database tables migrated")

	// Ensure uploads directory exists
	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		log.Fatalf("Failed to create uploads directory: %v", err)
	}

	router := gin.Default()

	// Serve uploaded files
	router.Static("/uploads", uploadsDir)

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "pos-engine"})
	})
	router.GET("/ready", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(503, gin.H{"status": "not ready"})
			return
		}
		c.JSON(200, gin.H{"status": "ready"})
	})

	v1 := router.Group("/api/v1/pos")
	v1.Use(tenantMiddleware())
	{
		v1.GET("/products", listProducts)
		v1.POST("/products", createProduct)
		v1.GET("/products/:id", getProduct)
		v1.PUT("/products/:id", updateProduct)
		v1.GET("/products/:id/modifiers", getProductModifiers)
		v1.POST("/products/:id/modifier-groups", linkModifierGroup)

		v1.GET("/categories", listCategories)
		v1.POST("/categories", createCategory)

		v1.GET("/modifier-groups", listModifierGroups)
		v1.POST("/modifier-groups", createModifierGroup)

		v1.GET("/locations", listLocations)

		v1.POST("/orders", createOrder)
		v1.GET("/orders", listOrders)
		v1.GET("/orders/:id", getOrder)
		v1.PUT("/orders/:id/status", updateOrderStatus)
		v1.POST("/orders/:id/complete", completeOrder)
		v1.POST("/orders/:id/cancel", cancelOrder)
		v1.POST("/orders/:id/accept", acceptOrder)

		v1.POST("/payments", processPayment)
		v1.GET("/payments/:orderId", getOrderPayments)

		v1.GET("/customers", listCustomers)
		v1.POST("/customers", createCustomer)

		v1.POST("/addresses", createAddress)
		v1.GET("/addresses/:customerId", listAddresses)

		v1.GET("/reviews", listReviews)
		v1.POST("/reviews", createReview)
		v1.PUT("/reviews/:id/reply", replyToReview)
		v1.GET("/reviews/stats", getReviewStats)
		v1.GET("/reviews/:id/item-ratings", getItemRatings)

		v1.GET("/store", getStoreInfo)

		v1.GET("/inventory", listInventory)
		v1.PUT("/inventory/:productId", updateInventory)

		v1.GET("/reports/daily-sales", getDailySales)
		v1.GET("/reports/top-products", getTopProducts)

		v1.POST("/seed/cafe-menu", seedCafeMenu)

		// App banner / slider settings
		v1.GET("/app-banners", listAppBanners)
		v1.POST("/app-banners", upsertAppBanner)
		v1.PUT("/app-banners/:id", updateAppBanner)
		v1.DELETE("/app-banners/:id", deleteAppBanner)
		v1.GET("/app-settings", getAppSettings)
		v1.PUT("/app-settings", updateAppSettings)

		// File upload
		v1.POST("/upload", uploadFile)
	}

	log.Printf("POS Engine listening on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func tenantMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := c.GetHeader("X-Tenant-ID")
		if tenantID == "" {
			tenantID = c.Query("tenantId")
		}
		if tenantID == "" {
			tenantID = "4fcf6201-0e81-41a7-8b61-356d39def62a"
		}
		c.Set("tenantId", tenantID)
		c.Next()
	}
}

// ── Products ────────────────────────────────────────────────

func listProducts(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query(
		`SELECT p.id, p.name, p.sku, p.price, p.currency, p.product_type, p.is_active,
		        COALESCE(p.description, ''), COALESCE(p.barcode, ''),
		        COALESCE(c.name, '') as category_name, p.category_id,
		        COALESCE(p.image_url, ''), p.created_at
		 FROM products p
		 LEFT JOIN categories c ON c.id = p.category_id
		 WHERE p.tenant_id = $1
		 ORDER BY COALESCE(c.sort_order, 999), p.name`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	products := []gin.H{}
	for rows.Next() {
		var id, name, sku, currency, ptype, desc, barcode, catName, imageUrl string
		var catID sql.NullString
		var price float64
		var active bool
		var createdAt time.Time
		rows.Scan(&id, &name, &sku, &price, &currency, &ptype, &active, &desc, &barcode, &catName, &catID, &imageUrl, &createdAt)
		p := gin.H{
			"id": id, "name": name, "sku": sku, "price": price, "currency": currency,
			"type": ptype, "isActive": active, "description": desc, "barcode": barcode,
			"categoryName": catName, "categoryId": catID.String, "imageUrl": imageUrl, "createdAt": createdAt,
		}
		var hasRequired bool
		db.QueryRow("SELECT EXISTS(SELECT 1 FROM product_modifier_groups pmg JOIN modifier_groups mg ON mg.id = pmg.modifier_group_id WHERE pmg.product_id = $1 AND mg.is_required = true)", id).Scan(&hasRequired)
		p["hasRequiredModifiers"] = hasRequired
		products = append(products, p)
	}
	c.JSON(200, gin.H{"products": products, "total": len(products)})
}

func createProduct(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		Name        string  `json:"name" binding:"required"`
		SKU         string  `json:"sku"`
		Price       float64 `json:"price" binding:"required"`
		CategoryID  string  `json:"categoryId"`
		Description string  `json:"description"`
		ProductType string  `json:"type"`
		TaxRate     float64 `json:"taxRate"`
		ImageUrl    string  `json:"imageUrl"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.ProductType == "" {
		req.ProductType = "simple"
	}
	if req.SKU == "" {
		req.SKU = strings.ToUpper(strings.ReplaceAll(req.Name, " ", "-"))[:min(20, len(req.Name))]
	}

	id := uuid.New().String()
	var catID *string
	if req.CategoryID != "" {
		catID = &req.CategoryID
	}

	_, err := db.Exec(
		`INSERT INTO products (id, tenant_id, category_id, sku, name, description, price, currency, tax_rate, product_type, is_active, image_url)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, 'SAR', $8, $9, true, $10)`,
		id, tenantID, catID, req.SKU, req.Name, req.Description, req.Price, req.TaxRate, req.ProductType, req.ImageUrl,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "name": req.Name, "sku": req.SKU, "price": req.Price, "imageUrl": req.ImageUrl})
}

func getProduct(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	var name, sku, currency, ptype, desc, imageUrl string
	var price, taxRate float64
	var active bool
	var catID sql.NullString
	err := db.QueryRow(
		`SELECT name, sku, price, currency, product_type, COALESCE(tax_rate,0), is_active,
		        COALESCE(description,''), COALESCE(image_url,''), category_id
		 FROM products WHERE id = $1 AND tenant_id = $2`, id, tenantID,
	).Scan(&name, &sku, &price, &currency, &ptype, &taxRate, &active, &desc, &imageUrl, &catID)
	if err != nil {
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(200, gin.H{
		"id": id, "name": name, "sku": sku, "price": price, "currency": currency,
		"type": ptype, "taxRate": taxRate, "isActive": active,
		"description": desc, "imageUrl": imageUrl, "categoryId": catID.String,
	})
}

func updateProduct(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	var req struct {
		Name        string   `json:"name"`
		Price       *float64 `json:"price"`
		IsActive    *bool    `json:"isActive"`
		Description string   `json:"description"`
		ImageUrl    string   `json:"imageUrl"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := db.Exec(
		`UPDATE products SET
			name = COALESCE(NULLIF($1,''), name),
			price = COALESCE($2, price),
			is_active = COALESCE($3, is_active),
			description = COALESCE(NULLIF($4,''), description),
			image_url = COALESCE(NULLIF($5,''), image_url)
		 WHERE id = $6 AND tenant_id = $7`,
		req.Name, req.Price, req.IsActive, req.Description, req.ImageUrl, id, tenantID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(200, gin.H{"message": "Product updated"})
}

func getProductModifiers(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	productID := c.Param("id")
	rows, err := db.Query(
		`SELECT mg.id, mg.name, COALESCE(mg.display_name, mg.name), mg.selection_type,
		        mg.min_selections, mg.max_selections, mg.is_required, mg.sort_order
		 FROM modifier_groups mg
		 JOIN product_modifier_groups pmg ON pmg.modifier_group_id = mg.id
		 WHERE pmg.product_id = $1 AND mg.tenant_id = $2 AND mg.is_active = true
		 ORDER BY pmg.sort_order, mg.sort_order`, productID, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	groups := []gin.H{}
	for rows.Next() {
		var gid, gname, displayName, selType string
		var minSel, maxSel, sortOrder int
		var required bool
		rows.Scan(&gid, &gname, &displayName, &selType, &minSel, &maxSel, &required, &sortOrder)

		itemRows, _ := db.Query(
			`SELECT id, name, price_adjustment, is_default, sort_order
			 FROM modifier_items WHERE modifier_group_id = $1 AND tenant_id = $2 AND is_active = true
			 ORDER BY sort_order`, gid, tenantID)
		items := []gin.H{}
		if itemRows != nil {
			for itemRows.Next() {
				var iid, iname string
				var priceAdj float64
				var isDef bool
				var iSort int
				itemRows.Scan(&iid, &iname, &priceAdj, &isDef, &iSort)
				items = append(items, gin.H{"id": iid, "name": iname, "priceAdjustment": priceAdj, "isDefault": isDef, "sortOrder": iSort})
			}
			itemRows.Close()
		}

		groups = append(groups, gin.H{
			"id": gid, "name": gname, "displayName": displayName,
			"selectionType": selType, "minSelections": minSel, "maxSelections": maxSel,
			"isRequired": required, "sortOrder": sortOrder, "items": items,
		})
	}
	c.JSON(200, gin.H{"modifierGroups": groups, "total": len(groups)})
}

func linkModifierGroup(c *gin.Context) {
	productID := c.Param("id")
	var req struct {
		ModifierGroupID string `json:"modifierGroupId" binding:"required"`
		SortOrder       int    `json:"sortOrder"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	_, err := db.Exec(
		`INSERT INTO product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES ($1, $2, $3)
		 ON CONFLICT (product_id, modifier_group_id) DO UPDATE SET sort_order = $3`,
		productID, req.ModifierGroupID, req.SortOrder)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Modifier group linked"})
}

// ── Categories ──────────────────────────────────────────────

func listCategories(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query(
		`SELECT id, name, slug, sort_order, is_active, COALESCE(image_url, '')
		 FROM categories WHERE tenant_id = $1 ORDER BY sort_order`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	cats := []gin.H{}
	for rows.Next() {
		var id, name, slug, imageUrl string
		var sortOrder int
		var active bool
		rows.Scan(&id, &name, &slug, &sortOrder, &active, &imageUrl)
		cats = append(cats, gin.H{"id": id, "name": name, "slug": slug, "sortOrder": sortOrder, "isActive": active, "imageUrl": imageUrl})
	}
	c.JSON(200, gin.H{"categories": cats, "total": len(cats)})
}

func createCategory(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		Name      string `json:"name" binding:"required"`
		Slug      string `json:"slug"`
		SortOrder int    `json:"sortOrder"`
		ImageUrl  string `json:"imageUrl"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.Slug == "" {
		req.Slug = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	}
	id := uuid.New().String()
	_, err := db.Exec("INSERT INTO categories (id, tenant_id, name, slug, sort_order, image_url) VALUES ($1,$2,$3,$4,$5,$6)",
		id, tenantID, req.Name, req.Slug, req.SortOrder, req.ImageUrl)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "name": req.Name, "slug": req.Slug, "imageUrl": req.ImageUrl})
}

// ── Modifier Groups ─────────────────────────────────────────

func listModifierGroups(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query(
		`SELECT id, name, COALESCE(display_name, name), selection_type, min_selections, max_selections, is_required, sort_order
		 FROM modifier_groups WHERE tenant_id = $1 AND is_active = true ORDER BY sort_order`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	groups := []gin.H{}
	for rows.Next() {
		var gid, gname, displayName, selType string
		var minSel, maxSel, sortOrder int
		var required bool
		rows.Scan(&gid, &gname, &displayName, &selType, &minSel, &maxSel, &required, &sortOrder)

		itemRows, _ := db.Query(
			`SELECT id, name, price_adjustment, is_default, sort_order
			 FROM modifier_items WHERE modifier_group_id = $1 AND tenant_id = $2 AND is_active = true
			 ORDER BY sort_order`, gid, tenantID)
		items := []gin.H{}
		if itemRows != nil {
			for itemRows.Next() {
				var iid, iname string
				var priceAdj float64
				var isDef bool
				var iSort int
				itemRows.Scan(&iid, &iname, &priceAdj, &isDef, &iSort)
				items = append(items, gin.H{"id": iid, "name": iname, "priceAdjustment": priceAdj, "isDefault": isDef, "sortOrder": iSort})
			}
			itemRows.Close()
		}

		groups = append(groups, gin.H{
			"id": gid, "name": gname, "displayName": displayName,
			"selectionType": selType, "minSelections": minSel, "maxSelections": maxSel,
			"isRequired": required, "sortOrder": sortOrder, "items": items,
		})
	}
	c.JSON(200, gin.H{"modifierGroups": groups, "total": len(groups)})
}

func createModifierGroup(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		Name          string `json:"name" binding:"required"`
		DisplayName   string `json:"displayName"`
		SelectionType string `json:"selectionType"`
		MinSelections int    `json:"minSelections"`
		MaxSelections int    `json:"maxSelections"`
		IsRequired    bool   `json:"isRequired"`
		SortOrder     int    `json:"sortOrder"`
		Items         []struct {
			Name            string  `json:"name" binding:"required"`
			PriceAdjustment float64 `json:"priceAdjustment"`
			IsDefault       bool    `json:"isDefault"`
			SortOrder       int     `json:"sortOrder"`
		} `json:"items"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.SelectionType == "" {
		req.SelectionType = "single"
	}
	if req.MaxSelections == 0 {
		req.MaxSelections = 1
	}
	if req.DisplayName == "" {
		req.DisplayName = req.Name
	}

	groupID := uuid.New().String()
	_, err := db.Exec(
		`INSERT INTO modifier_groups (id, tenant_id, name, display_name, selection_type, min_selections, max_selections, is_required, sort_order)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		groupID, tenantID, req.Name, req.DisplayName, req.SelectionType, req.MinSelections, req.MaxSelections, req.IsRequired, req.SortOrder)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	items := []gin.H{}
	for _, item := range req.Items {
		itemID := uuid.New().String()
		db.Exec(
			`INSERT INTO modifier_items (id, tenant_id, modifier_group_id, name, price_adjustment, is_default, sort_order)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			itemID, tenantID, groupID, item.Name, item.PriceAdjustment, item.IsDefault, item.SortOrder)
		items = append(items, gin.H{"id": itemID, "name": item.Name, "priceAdjustment": item.PriceAdjustment, "isDefault": item.IsDefault})
	}

	c.JSON(201, gin.H{"id": groupID, "name": req.Name, "items": items})
}

// ── Locations ───────────────────────────────────────────────

func listLocations(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query("SELECT id, name, timezone, currency, tax_rate, status FROM locations WHERE tenant_id = $1", tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	locs := []gin.H{}
	for rows.Next() {
		var id, name, tz, cur, status string
		var taxRate float64
		rows.Scan(&id, &name, &tz, &cur, &taxRate, &status)
		locs = append(locs, gin.H{"id": id, "name": name, "timezone": tz, "currency": cur, "taxRate": taxRate, "status": status})
	}
	c.JSON(200, gin.H{"locations": locs, "total": len(locs)})
}

// ── Orders ──────────────────────────────────────────────────

func createOrder(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		LocationID string `json:"locationId"`
		OrderType  string `json:"orderType"`
		Items      []struct {
			ProductID string  `json:"productId" binding:"required"`
			Quantity  float64 `json:"quantity" binding:"required"`
			Notes     string  `json:"notes"`
			Modifiers []struct {
				GroupID   string  `json:"groupId"`
				GroupName string  `json:"groupName"`
				ItemID    string  `json:"itemId"`
				ItemName  string  `json:"itemName"`
				Price     float64 `json:"priceAdjustment"`
			} `json:"modifiers"`
		} `json:"items" binding:"required,min=1"`
		CustomerID string `json:"customerId"`
		Notes      string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.OrderType == "" {
		req.OrderType = "pickup"
	}
	if req.LocationID == "" {
		db.QueryRow("SELECT id FROM locations WHERE tenant_id = $1 AND status = 'active' LIMIT 1", tenantID).Scan(&req.LocationID)
		if req.LocationID == "" {
			req.LocationID = uuid.New().String()
		}
	}

	var subtotal, taxTotal float64
	type itemCalc struct {
		productID     string
		name          string
		price         float64
		taxRate       float64
		quantity      float64
		notes         string
		modifiers     string
		modifierTotal float64
	}
	var items []itemCalc
	for _, item := range req.Items {
		var name string
		var price, taxRate float64
		err := db.QueryRow("SELECT name, price, COALESCE(tax_rate,0) FROM products WHERE id = $1 AND tenant_id = $2", item.ProductID, tenantID).
			Scan(&name, &price, &taxRate)
		if err != nil {
			c.JSON(400, gin.H{"error": fmt.Sprintf("Product %s not found", item.ProductID)})
			return
		}
		var modTotal float64
		for _, mod := range item.Modifiers {
			modTotal += mod.Price
		}
		lineTotal := (price + modTotal) * item.Quantity
		lineTax := lineTotal * taxRate / 100
		subtotal += lineTotal
		taxTotal += lineTax
		modJSON, _ := json.Marshal(item.Modifiers)
		items = append(items, itemCalc{item.ProductID, name, price, taxRate, item.Quantity, item.Notes, string(modJSON), modTotal})
	}
	total := subtotal + taxTotal

	orderID := uuid.New().String()
	orderNum := fmt.Sprintf("ORD-%s-%s", time.Now().Format("20060102150405"), uuid.New().String()[:4])

	tx, err := db.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Transaction failed"})
		return
	}

	var customerID *string
	if req.CustomerID != "" {
		customerID = &req.CustomerID
	}
	_, err = tx.Exec(
		`INSERT INTO orders (id, tenant_id, location_id, order_number, status, order_type, customer_id, subtotal, tax_amount, total, currency, notes)
		 VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9, 'SAR', $10)`,
		orderID, tenantID, req.LocationID, orderNum, req.OrderType, customerID, subtotal, taxTotal, total, req.Notes,
	)
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	orderItems := []gin.H{}
	for _, item := range items {
		itemID := uuid.New().String()
		unitPrice := item.price + item.modifierTotal
		itemTax := unitPrice * item.quantity * item.taxRate / 100
		itemTotal := unitPrice*item.quantity + itemTax
		_, err = tx.Exec(
			`INSERT INTO order_items (id, tenant_id, order_id, product_id, name, quantity, unit_price, tax_amount, total_price, notes, modifiers)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
			itemID, tenantID, orderID, item.productID, item.name, item.quantity, unitPrice, itemTax, itemTotal, item.notes, item.modifiers,
		)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		orderItems = append(orderItems, gin.H{
			"id": itemID, "productId": item.productID, "name": item.name,
			"quantity": item.quantity, "unitPrice": unitPrice, "taxAmount": itemTax, "totalPrice": itemTotal,
		})
	}

	tx.Commit()

	c.JSON(201, gin.H{
		"id": orderID, "orderNumber": orderNum, "status": "pending",
		"orderType": req.OrderType, "locationId": req.LocationID,
		"subtotal": subtotal, "taxAmount": taxTotal, "total": total, "currency": "SAR",
		"items": orderItems,
	})
}

func listOrders(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	status := c.Query("status")
	customerID := c.Query("customerId")

	query := `SELECT o.id, o.order_number, o.status, o.order_type, o.subtotal, o.tax_amount,
	           COALESCE(o.discount_amount, 0), o.total, o.currency, o.created_at,
	           COALESCE(cu.first_name || ' ' || cu.last_name, ''),
	           (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id)
	           FROM orders o
	           LEFT JOIN customers cu ON cu.id = o.customer_id
	           WHERE o.tenant_id = $1`
	args := []interface{}{tenantID}
	argN := 2
	if status != "" {
		query += fmt.Sprintf(" AND o.status = $%d", argN)
		args = append(args, status)
		argN++
	}
	if customerID != "" {
		query += fmt.Sprintf(" AND o.customer_id = $%d", argN)
		args = append(args, customerID)
		argN++
	}
	query += " ORDER BY o.created_at DESC LIMIT 50"

	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	orders := []gin.H{}
	for rows.Next() {
		var id, num, st, ot, cur, customerName string
		var sub, tax, disc, tot float64
		var createdAt time.Time
		var itemCount int
		rows.Scan(&id, &num, &st, &ot, &sub, &tax, &disc, &tot, &cur, &createdAt, &customerName, &itemCount)
		orders = append(orders, gin.H{
			"id": id, "orderNumber": num, "status": st, "orderType": ot,
			"subtotal": sub, "taxAmount": tax, "discountAmount": disc,
			"totalAmount": tot, "total": tot, "currency": cur, "createdAt": createdAt,
			"customerName": customerName, "itemCount": itemCount,
		})
	}
	c.JSON(200, gin.H{"orders": orders, "total": len(orders)})
}

func getOrder(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")

	var num, st, ot, cur, customerName string
	var sub, tax, disc, tot float64
	var createdAt time.Time
	err := db.QueryRow(
		`SELECT o.order_number, o.status, o.order_type, o.subtotal, o.tax_amount,
		        COALESCE(o.discount_amount, 0), o.total, o.currency, o.created_at,
		        COALESCE(cu.first_name || ' ' || cu.last_name, '')
		 FROM orders o
		 LEFT JOIN customers cu ON cu.id = o.customer_id
		 WHERE o.id = $1 AND o.tenant_id = $2`,
		id, tenantID,
	).Scan(&num, &st, &ot, &sub, &tax, &disc, &tot, &cur, &createdAt, &customerName)
	if err != nil {
		c.JSON(404, gin.H{"error": "Order not found"})
		return
	}

	rows, _ := db.Query("SELECT id, product_id, name, quantity, unit_price, tax_amount, total_price, COALESCE(modifiers, '[]') FROM order_items WHERE order_id = $1 AND tenant_id = $2", id, tenantID)
	defer rows.Close()
	items := []gin.H{}
	for rows.Next() {
		var iid, pid, iname, mods string
		var qty, up, itax, itot float64
		rows.Scan(&iid, &pid, &iname, &qty, &up, &itax, &itot, &mods)
		var modifiers interface{}
		json.Unmarshal([]byte(mods), &modifiers)
		items = append(items, gin.H{
			"id": iid, "productId": pid, "productName": iname, "name": iname, "quantity": qty,
			"unitPrice": up, "taxAmount": itax, "totalPrice": itot, "modifiers": modifiers,
		})
	}

	c.JSON(200, gin.H{
		"id": id, "orderNumber": num, "status": st, "orderType": ot,
		"subtotal": sub, "taxAmount": tax, "discountAmount": disc,
		"totalAmount": tot, "total": tot, "currency": cur,
		"items": items, "createdAt": createdAt, "customerName": customerName,
	})
}

func updateOrderStatus(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, _ := db.Exec("UPDATE orders SET status = $1 WHERE id = $2 AND tenant_id = $3", req.Status, id, tenantID)
	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(404, gin.H{"error": "Order not found"})
		return
	}
	c.JSON(200, gin.H{"message": "Status updated", "status": req.Status})
}

func acceptOrder(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	res, _ := db.Exec("UPDATE orders SET status = 'accepted' WHERE id = $1 AND tenant_id = $2 AND status = 'pending'", id, tenantID)
	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(400, gin.H{"error": "Order not found or cannot be accepted"})
		return
	}
	c.JSON(200, gin.H{"message": "Order accepted", "status": "accepted"})
}

func completeOrder(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	res, _ := db.Exec("UPDATE orders SET status = 'completed', completed_at = NOW() WHERE id = $1 AND tenant_id = $2 AND status != 'completed'", id, tenantID)
	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(404, gin.H{"error": "Order not found or already completed"})
		return
	}
	c.JSON(200, gin.H{"message": "Order completed", "status": "completed"})
}

func cancelOrder(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	res, _ := db.Exec("UPDATE orders SET status = 'cancelled' WHERE id = $1 AND tenant_id = $2 AND status IN ('pending','accepted')", id, tenantID)
	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(400, gin.H{"error": "Order not found or cannot be cancelled"})
		return
	}
	c.JSON(200, gin.H{"message": "Order cancelled", "status": "cancelled"})
}

// ── Payments ────────────────────────────────────────────────

func processPayment(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		OrderID string  `json:"orderId" binding:"required"`
		Method  string  `json:"method" binding:"required"`
		Amount  float64 `json:"amount" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	id := uuid.New().String()
	_, err := db.Exec(
		"INSERT INTO payments (id, tenant_id, order_id, method, amount, currency, status) VALUES ($1,$2,$3,$4,$5,'SAR','completed')",
		id, tenantID, req.OrderID, req.Method, req.Amount,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{"id": id, "orderId": req.OrderID, "method": req.Method, "amount": req.Amount, "status": "completed"})
}

func getOrderPayments(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	orderID := c.Param("orderId")
	rows, err := db.Query("SELECT id, method, amount, currency, status, created_at FROM payments WHERE order_id = $1 AND tenant_id = $2", orderID, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	payments := []gin.H{}
	for rows.Next() {
		var id, method, cur, st string
		var amount float64
		var createdAt time.Time
		rows.Scan(&id, &method, &amount, &cur, &st, &createdAt)
		payments = append(payments, gin.H{"id": id, "method": method, "amount": amount, "currency": cur, "status": st, "createdAt": createdAt})
	}
	c.JSON(200, gin.H{"payments": payments, "total": len(payments)})
}

// ── Customers ───────────────────────────────────────────────

func listCustomers(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query("SELECT id, COALESCE(first_name,''), COALESCE(last_name,''), COALESCE(email,''), COALESCE(phone,''), loyalty_points, total_spent, visit_count FROM customers WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50", tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	customers := []gin.H{}
	for rows.Next() {
		var id, fn, ln, email, phone string
		var points, visits int
		var spent float64
		rows.Scan(&id, &fn, &ln, &email, &phone, &points, &spent, &visits)
		customers = append(customers, gin.H{"id": id, "firstName": fn, "lastName": ln, "email": email, "phone": phone, "loyaltyPoints": points, "totalSpent": spent, "visitCount": visits})
	}
	c.JSON(200, gin.H{"customers": customers, "total": len(customers)})
}

func createCustomer(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	id := uuid.New().String()
	_, err := db.Exec("INSERT INTO customers (id, tenant_id, first_name, last_name, email, phone) VALUES ($1,$2,$3,$4,$5,$6)",
		id, tenantID, req.FirstName, req.LastName, req.Email, req.Phone)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "firstName": req.FirstName, "lastName": req.LastName, "email": req.Email, "phone": req.Phone})
}

// ── Addresses ───────────────────────────────────────────────

func createAddress(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		CustomerID string  `json:"customerId"`
		Label      string  `json:"label"`
		Address    string  `json:"address" binding:"required"`
		City       string  `json:"city"`
		Country    string  `json:"country"`
		PostalCode string  `json:"postalCode"`
		Latitude   float64 `json:"latitude"`
		Longitude  float64 `json:"longitude"`
		IsDefault  *bool   `json:"isDefault"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.Label == "" {
		req.Label = "home"
	}
	isDefault := true
	if req.IsDefault != nil {
		isDefault = *req.IsDefault
	}

	id := uuid.New().String()
	var custID *string
	if req.CustomerID != "" {
		custID = &req.CustomerID
	}

	_, err := db.Exec(
		`INSERT INTO customer_addresses (id, tenant_id, customer_id, label, address_line, city, country, postal_code, latitude, longitude, is_default)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
		id, tenantID, custID, req.Label, req.Address, req.City, req.Country, req.PostalCode, req.Latitude, req.Longitude, isDefault,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{
		"id": id, "address": req.Address, "city": req.City, "country": req.Country,
		"latitude": req.Latitude, "longitude": req.Longitude, "label": req.Label, "isDefault": isDefault,
	})
}

func listAddresses(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	customerID := c.Param("customerId")
	rows, err := db.Query(
		`SELECT id, label, address_line, city, country, postal_code, latitude, longitude, is_default, created_at
		 FROM customer_addresses WHERE tenant_id = $1 AND customer_id = $2 ORDER BY is_default DESC, created_at DESC`,
		tenantID, customerID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	addresses := []gin.H{}
	for rows.Next() {
		var id, label, addr, city, country, postal string
		var lat, lng float64
		var def bool
		var createdAt time.Time
		rows.Scan(&id, &label, &addr, &city, &country, &postal, &lat, &lng, &def, &createdAt)
		addresses = append(addresses, gin.H{
			"id": id, "label": label, "address": addr, "city": city, "country": country,
			"postalCode": postal, "latitude": lat, "longitude": lng, "isDefault": def, "createdAt": createdAt,
		})
	}
	c.JSON(200, gin.H{"addresses": addresses, "total": len(addresses)})
}

// ── Reviews ─────────────────────────────────────────────────

func listReviews(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	filter := c.Query("filter")

	query := `SELECT r.id, COALESCE(r.order_id::text, ''), COALESCE(r.customer_id::text, ''),
	                  COALESCE(cu.first_name || ' ' || cu.last_name, 'Anonymous'), r.rating,
	                  COALESCE(r.comment, ''), COALESCE(r.merchant_reply, ''),
	                  r.merchant_replied_at, r.created_at
	           FROM reviews r
	           LEFT JOIN customers cu ON cu.id = r.customer_id
	           WHERE r.tenant_id = $1 AND r.is_visible = true`

	if filter == "pending_reply" {
		query += " AND r.merchant_reply IS NULL"
	} else if filter == "replied" {
		query += " AND r.merchant_reply IS NOT NULL"
	}

	query += " ORDER BY r.created_at DESC LIMIT 100"

	rows, err := db.Query(query, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	reviews := []gin.H{}
	for rows.Next() {
		var rid, orderID, customerID, customerName, comment, reply string
		var rating int
		var repliedAt sql.NullTime
		var createdAt time.Time
		rows.Scan(&rid, &orderID, &customerID, &customerName, &rating, &comment, &reply, &repliedAt, &createdAt)
		r := gin.H{
			"id": rid, "orderId": orderID, "customerId": customerID, "customerName": customerName,
			"rating": rating, "comment": comment, "createdAt": createdAt,
		}
		if reply != "" {
			r["merchantReply"] = reply
		}
		if repliedAt.Valid {
			r["merchantRepliedAt"] = repliedAt.Time
		}
		reviews = append(reviews, r)
	}
	c.JSON(200, gin.H{"reviews": reviews, "total": len(reviews)})
}

func createReview(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		OrderID     string `json:"orderId"`
		CustomerID  string `json:"customerId"`
		Rating      int    `json:"rating" binding:"required,min=1,max=5"`
		Comment     string `json:"comment"`
		ItemRatings []struct {
			ProductID   string `json:"productId"`
			ProductName string `json:"productName"`
			Rating      int    `json:"rating"`
			Comment     string `json:"comment"`
		} `json:"itemRatings"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	id := uuid.New().String()
	var orderID, customerID *string
	if req.OrderID != "" {
		orderID = &req.OrderID
	}
	if req.CustomerID != "" {
		customerID = &req.CustomerID
	}

	_, err := db.Exec(
		`INSERT INTO reviews (id, tenant_id, order_id, customer_id, rating, comment) VALUES ($1, $2, $3, $4, $5, $6)`,
		id, tenantID, orderID, customerID, req.Rating, req.Comment)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Insert item-level ratings
	savedItemRatings := []gin.H{}
	for _, ir := range req.ItemRatings {
		if ir.Rating > 0 {
			irID := uuid.New().String()
			db.Exec(
				`INSERT INTO item_ratings (id, tenant_id, review_id, product_id, product_name, rating, comment)
				 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
				irID, tenantID, id, ir.ProductID, ir.ProductName, ir.Rating, ir.Comment)
			savedItemRatings = append(savedItemRatings, gin.H{
				"id": irID, "productId": ir.ProductID, "productName": ir.ProductName,
				"rating": ir.Rating, "comment": ir.Comment,
			})
		}
	}

	var avg float64
	var count int
	db.QueryRow("SELECT COALESCE(AVG(rating), 0), COUNT(*) FROM reviews WHERE tenant_id = $1 AND is_visible = true", tenantID).Scan(&avg, &count)
	db.Exec("UPDATE tenants SET rating_average = $1, rating_count = $2 WHERE id = $3", math.Round(avg*10)/10, count, tenantID)

	c.JSON(201, gin.H{"id": id, "rating": req.Rating, "comment": req.Comment, "itemRatings": savedItemRatings})
}

func getItemRatings(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	reviewID := c.Param("id")

	rows, err := db.Query(
		`SELECT id, product_id, product_name, rating, COALESCE(comment, ''), created_at
		 FROM item_ratings WHERE tenant_id = $1 AND review_id = $2 ORDER BY created_at`,
		tenantID, reviewID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	ratings := []gin.H{}
	for rows.Next() {
		var id, productID, productName, comment string
		var rating int
		var createdAt time.Time
		rows.Scan(&id, &productID, &productName, &rating, &comment, &createdAt)
		ratings = append(ratings, gin.H{
			"id": id, "productId": productID, "productName": productName,
			"rating": rating, "comment": comment, "createdAt": createdAt,
		})
	}
	c.JSON(200, gin.H{"itemRatings": ratings})
}

func replyToReview(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	var req struct {
		Reply string `json:"reply" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, _ := db.Exec("UPDATE reviews SET merchant_reply = $1, merchant_replied_at = NOW() WHERE id = $2 AND tenant_id = $3", req.Reply, id, tenantID)
	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(404, gin.H{"error": "Review not found"})
		return
	}
	c.JSON(200, gin.H{"message": "Reply added"})
}

func getReviewStats(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var avg float64
	var total int
	db.QueryRow("SELECT COALESCE(AVG(rating), 0), COUNT(*) FROM reviews WHERE tenant_id = $1 AND is_visible = true", tenantID).Scan(&avg, &total)

	distribution := make([]int, 5)
	rows, _ := db.Query("SELECT rating, COUNT(*) FROM reviews WHERE tenant_id = $1 AND is_visible = true GROUP BY rating", tenantID)
	if rows != nil {
		for rows.Next() {
			var r, cnt int
			rows.Scan(&r, &cnt)
			if r >= 1 && r <= 5 {
				distribution[r-1] = cnt
			}
		}
		rows.Close()
	}

	c.JSON(200, gin.H{"averageRating": math.Round(avg*10) / 10, "totalCount": total, "distribution": distribution})
}

// ── Store Info ──────────────────────────────────────────────

func getStoreInfo(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var name, slug string
	var logoUrl, heroImageUrl, cuisineType sql.NullString
	var ratingAvg float64
	var ratingCount, deliveryMin, deliveryMax int
	var deliveryFee, minOrder float64

	err := db.QueryRow(
		`SELECT name, slug, logo_url, hero_image_url, COALESCE(rating_average, 0), COALESCE(rating_count, 0),
		        COALESCE(delivery_time_min, 15), COALESCE(delivery_time_max, 30),
		        COALESCE(delivery_fee, 0), COALESCE(minimum_order, 0), cuisine_type
		 FROM tenants WHERE id = $1`, tenantID,
	).Scan(&name, &slug, &logoUrl, &heroImageUrl, &ratingAvg, &ratingCount, &deliveryMin, &deliveryMax, &deliveryFee, &minOrder, &cuisineType)
	if err != nil {
		c.JSON(404, gin.H{"error": "Store not found"})
		return
	}

	store := gin.H{
		"id": tenantID, "name": name, "slug": slug,
		"ratingAverage": ratingAvg, "ratingCount": ratingCount,
		"deliveryTimeMin": deliveryMin, "deliveryTimeMax": deliveryMax,
		"deliveryFee": deliveryFee, "minimumOrder": minOrder,
		"cuisineType": cuisineType.String, "isOpen": true,
	}
	if logoUrl.Valid {
		store["logoUrl"] = logoUrl.String
	}
	if heroImageUrl.Valid {
		store["heroImageUrl"] = heroImageUrl.String
	}
	c.JSON(200, gin.H{"store": store})
}

// ── Inventory ───────────────────────────────────────────────

func listInventory(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query(
		`SELECT i.id, i.product_id, p.name, i.location_id, l.name, i.quantity, i.low_stock_threshold
		 FROM inventory i
		 JOIN products p ON p.id = i.product_id
		 JOIN locations l ON l.id = i.location_id
		 WHERE i.tenant_id = $1`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	inv := []gin.H{}
	for rows.Next() {
		var id, pid, pname, lid, lname string
		var qty, threshold float64
		rows.Scan(&id, &pid, &pname, &lid, &lname, &qty, &threshold)
		inv = append(inv, gin.H{"id": id, "productId": pid, "productName": pname, "locationId": lid, "locationName": lname, "quantity": qty, "lowStockThreshold": threshold})
	}
	c.JSON(200, gin.H{"inventory": inv, "total": len(inv)})
}

func updateInventory(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	productID := c.Param("productId")
	var req struct {
		LocationID string  `json:"locationId" binding:"required"`
		Quantity   float64 `json:"quantity" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	_, err := db.Exec(
		`INSERT INTO inventory (id, tenant_id, product_id, location_id, quantity)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (tenant_id, product_id, location_id) DO UPDATE SET quantity = $5`,
		uuid.New().String(), tenantID, productID, req.LocationID, req.Quantity,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Inventory updated", "quantity": req.Quantity})
}

// ── Reports ─────────────────────────────────────────────────

func getDailySales(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	var totalOrders int
	var totalRevenue, totalTax float64
	db.QueryRow(
		`SELECT COUNT(*), COALESCE(SUM(total),0), COALESCE(SUM(tax_amount),0)
		 FROM orders WHERE tenant_id = $1 AND DATE(created_at) = $2 AND status = 'completed'`,
		tenantID, date,
	).Scan(&totalOrders, &totalRevenue, &totalTax)

	c.JSON(200, gin.H{"date": date, "totalOrders": totalOrders, "totalRevenue": totalRevenue, "totalTax": totalTax, "currency": "SAR"})
}

func getTopProducts(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query(
		`SELECT oi.product_id, oi.name, SUM(oi.quantity) as qty, SUM(oi.total_price) as revenue
		 FROM order_items oi
		 JOIN orders o ON o.id = oi.order_id
		 WHERE oi.tenant_id = $1 AND o.status = 'completed'
		 GROUP BY oi.product_id, oi.name
		 ORDER BY revenue DESC LIMIT 10`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	products := []gin.H{}
	for rows.Next() {
		var pid, name string
		var qty, revenue float64
		rows.Scan(&pid, &name, &qty, &revenue)
		products = append(products, gin.H{"productId": pid, "name": name, "quantitySold": qty, "revenue": revenue})
	}
	c.JSON(200, gin.H{"topProducts": products})
}

// ── Seed Cafe Menu ──────────────────────────────────────────

func seedCafeMenu(c *gin.Context) {
	tenantID := c.GetString("tenantId")

	// Ensure app_banners table exists
	db.Exec(`CREATE TABLE IF NOT EXISTS app_banners (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		tenant_id UUID NOT NULL,
		image_url TEXT NOT NULL DEFAULT '',
		link_url TEXT NOT NULL DEFAULT '',
		link_type TEXT NOT NULL DEFAULT 'external',
		title TEXT NOT NULL DEFAULT '',
		description TEXT NOT NULL DEFAULT '',
		sort_order INTEGER NOT NULL DEFAULT 0,
		is_active BOOLEAN NOT NULL DEFAULT true,
		show_overlay BOOLEAN NOT NULL DEFAULT false,
		overlay_title TEXT NOT NULL DEFAULT '',
		overlay_description TEXT NOT NULL DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	// Add columns if they don't exist (migration for existing tables)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS show_overlay BOOLEAN NOT NULL DEFAULT false`)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS overlay_title TEXT NOT NULL DEFAULT ''`)
	db.Exec(`ALTER TABLE app_banners ADD COLUMN IF NOT EXISTS overlay_description TEXT NOT NULL DEFAULT ''`)
	// Ensure app_settings table exists
	db.Exec(`CREATE TABLE IF NOT EXISTS app_settings (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		tenant_id UUID NOT NULL UNIQUE,
		banner_enabled BOOLEAN NOT NULL DEFAULT false,
		banner_mode TEXT NOT NULL DEFAULT 'single',
		auto_slide_interval INTEGER NOT NULL DEFAULT 5,
		updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)

	// Ensure item_ratings table exists
	db.Exec(`CREATE TABLE IF NOT EXISTS item_ratings (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		tenant_id UUID NOT NULL,
		review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
		product_id UUID,
		product_name TEXT NOT NULL DEFAULT '',
		rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
		comment TEXT,
		created_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	db.Exec("CREATE INDEX IF NOT EXISTS idx_item_ratings_review ON item_ratings(review_id)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_item_ratings_product ON item_ratings(product_id)")

	// Clean existing data
	db.Exec("DELETE FROM item_ratings WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM product_modifier_groups WHERE product_id IN (SELECT id FROM products WHERE tenant_id = $1)", tenantID)
	db.Exec("DELETE FROM modifier_items WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM modifier_groups WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM order_items WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM payments WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM reviews WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM orders WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM products WHERE tenant_id = $1", tenantID)
	db.Exec("DELETE FROM categories WHERE tenant_id = $1", tenantID)

	// Update store info
	db.Exec(`UPDATE tenants SET
		name = 'Berhot Cafe',
		hero_image_url = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
		logo_url = 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=200&q=80',
		delivery_time_min = 15, delivery_time_max = 30,
		delivery_fee = 5, minimum_order = 25, cuisine_type = 'Specialty Coffee & Pastries'
		WHERE id = $1`, tenantID)

	type catDef struct{ id, name, slug, image string; sort int }
	cats := []catDef{
		{uuid.New().String(), "Hot Drinks", "hot-drinks", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", 1},
		{uuid.New().String(), "Iced Drinks", "iced-drinks", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", 2},
		{uuid.New().String(), "Pastries", "pastries", "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80", 3},
		{uuid.New().String(), "Desserts", "desserts", "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80", 4},
		{uuid.New().String(), "Snacks", "snacks", "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80", 5},
		{uuid.New().String(), "Specials", "specials", "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80", 6},
	}
	catMap := map[string]string{}
	for _, cat := range cats {
		db.Exec("INSERT INTO categories (id, tenant_id, name, slug, sort_order, image_url, is_active) VALUES ($1,$2,$3,$4,$5,$6,true)",
			cat.id, tenantID, cat.name, cat.slug, cat.sort, cat.image)
		catMap[cat.slug] = cat.id
	}

	type prodDef struct{ name, desc, catSlug, image string; price float64 }
	products := []prodDef{
		{"Espresso", "Rich and bold single-origin espresso shot", "hot-drinks", "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80", 12},
		{"Cappuccino", "Classic Italian espresso with steamed milk foam", "hot-drinks", "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80", 18},
		{"Flat White", "Velvety micro-foam espresso with rich crema", "hot-drinks", "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&q=80", 20},
		{"Cafe Latte", "Smooth espresso with steamed milk and light foam", "hot-drinks", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", 18},
		{"Hot Chocolate", "Premium Belgian chocolate with steamed milk", "hot-drinks", "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80", 16},
		{"Arabic Coffee", "Traditional Saudi qahwa with cardamom", "hot-drinks", "https://images.unsplash.com/photo-1578899544060-9ba4a7e46929?w=400&q=80", 14},
		{"Iced Latte", "Double shot espresso over ice with cold milk", "iced-drinks", "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80", 22},
		{"Cold Brew", "Slow-steeped 18-hour cold brew, smooth and bold", "iced-drinks", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", 20},
		{"Iced Mocha", "Espresso, chocolate, and cold milk over ice", "iced-drinks", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", 24},
		{"Caramel Frappe", "Blended espresso with caramel and whipped cream", "iced-drinks", "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80", 28},
		{"Matcha Iced Latte", "Ceremonial grade matcha with oat milk over ice", "iced-drinks", "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&q=80", 24},
		{"Butter Croissant", "Flaky, golden French-style butter croissant", "pastries", "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80", 14},
		{"Chocolate Muffin", "Moist double chocolate chip muffin", "pastries", "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80", 16},
		{"Cinnamon Roll", "Warm cinnamon swirl with cream cheese glaze", "pastries", "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&q=80", 18},
		{"Almond Croissant", "Butter croissant filled with almond cream", "pastries", "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&q=80", 18},
		{"Cheesecake Slice", "New York-style creamy cheesecake", "desserts", "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80", 24},
		{"Tiramisu", "Classic Italian coffee-soaked mascarpone layers", "desserts", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", 26},
		{"Chocolate Brownie", "Rich fudgy brownie with walnuts", "desserts", "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80", 18},
		{"Granola Bowl", "Greek yogurt with house-made granola and berries", "snacks", "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80", 22},
		{"Avocado Toast", "Sourdough with smashed avocado, poached egg and chili", "snacks", "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=80", 28},
		{"Lavender Latte", "House-made lavender syrup with espresso and oat milk", "specials", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&q=80", 26},
		{"Spanish Latte", "Sweetened condensed milk with double espresso", "specials", "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&q=80", 24},
	}

	drinkIDs := []string{}
	for _, p := range products {
		pid := uuid.New().String()
		sku := strings.ToUpper(strings.ReplaceAll(p.name, " ", "-"))
		if len(sku) > 20 {
			sku = sku[:20]
		}
		db.Exec(`INSERT INTO products (id, tenant_id, category_id, sku, name, description, price, currency, tax_rate, product_type, is_active, image_url)
			VALUES ($1,$2,$3,$4,$5,$6,$7,'SAR',15,'simple',true,$8)`,
			pid, tenantID, catMap[p.catSlug], sku, p.name, p.desc, p.price, p.image)
		if p.catSlug == "hot-drinks" || p.catSlug == "iced-drinks" || p.catSlug == "specials" {
			drinkIDs = append(drinkIDs, pid)
		}
	}

	// Modifier groups
	sizeID := uuid.New().String()
	milkID := uuid.New().String()
	sugarID := uuid.New().String()
	extrasID := uuid.New().String()

	db.Exec(`INSERT INTO modifier_groups (id, tenant_id, name, display_name, selection_type, min_selections, max_selections, is_required, sort_order)
	         VALUES ($1, $2, 'Size', 'Choose Size', 'single', 1, 1, true, 1)`, sizeID, tenantID)
	for i, s := range []struct{ n string; p float64; d bool }{{"Small", 0, true}, {"Medium", 4, false}, {"Large", 8, false}} {
		db.Exec(`INSERT INTO modifier_items (id, tenant_id, modifier_group_id, name, price_adjustment, is_default, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
			uuid.New().String(), tenantID, sizeID, s.n, s.p, s.d, i)
	}

	db.Exec(`INSERT INTO modifier_groups (id, tenant_id, name, display_name, selection_type, min_selections, max_selections, is_required, sort_order)
	         VALUES ($1, $2, 'Milk Type', 'Choose Milk', 'single', 1, 1, false, 2)`, milkID, tenantID)
	for i, s := range []struct{ n string; p float64; d bool }{{"Regular Milk", 0, true}, {"Oat Milk", 5, false}, {"Almond Milk", 5, false}, {"Soy Milk", 4, false}, {"Skim Milk", 0, false}} {
		db.Exec(`INSERT INTO modifier_items (id, tenant_id, modifier_group_id, name, price_adjustment, is_default, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
			uuid.New().String(), tenantID, milkID, s.n, s.p, s.d, i)
	}

	db.Exec(`INSERT INTO modifier_groups (id, tenant_id, name, display_name, selection_type, min_selections, max_selections, is_required, sort_order)
	         VALUES ($1, $2, 'Sugar Level', 'Sugar Preference', 'single', 1, 1, false, 3)`, sugarID, tenantID)
	for i, s := range []struct{ n string; d bool }{{"Regular Sugar", true}, {"Less Sugar", false}, {"No Sugar", false}, {"Extra Sweet", false}} {
		db.Exec(`INSERT INTO modifier_items (id, tenant_id, modifier_group_id, name, price_adjustment, is_default, sort_order) VALUES ($1,$2,$3,$4,0,$5,$6)`,
			uuid.New().String(), tenantID, sugarID, s.n, s.d, i)
	}

	db.Exec(`INSERT INTO modifier_groups (id, tenant_id, name, display_name, selection_type, min_selections, max_selections, is_required, sort_order)
	         VALUES ($1, $2, 'Extras', 'Add Extras', 'multiple', 0, 3, false, 4)`, extrasID, tenantID)
	for i, s := range []struct{ n string; p float64 }{{"Extra Shot", 6}, {"Whipped Cream", 4}, {"Caramel Drizzle", 3}, {"Vanilla Syrup", 3}, {"Hazelnut Syrup", 3}} {
		db.Exec(`INSERT INTO modifier_items (id, tenant_id, modifier_group_id, name, price_adjustment, is_default, sort_order) VALUES ($1,$2,$3,$4,$5,false,$6)`,
			uuid.New().String(), tenantID, extrasID, s.n, s.p, i)
	}

	// Link modifiers to all drinks
	for _, pid := range drinkIDs {
		db.Exec("INSERT INTO product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES ($1,$2,1) ON CONFLICT DO NOTHING", pid, sizeID)
		db.Exec("INSERT INTO product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES ($1,$2,2) ON CONFLICT DO NOTHING", pid, milkID)
		db.Exec("INSERT INTO product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES ($1,$2,3) ON CONFLICT DO NOTHING", pid, sugarID)
		db.Exec("INSERT INTO product_modifier_groups (product_id, modifier_group_id, sort_order) VALUES ($1,$2,4) ON CONFLICT DO NOTHING", pid, extrasID)
	}

	c.JSON(200, gin.H{"message": "Cafe menu seeded successfully", "categories": len(cats), "products": len(products), "modifiers": 4})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// ── App Settings & Banner handlers ─────────────────────────────

func getAppSettings(c *gin.Context) {
	tenantID := c.GetString("tenantId")

	var bannerEnabled bool
	var bannerMode string
	var autoSlide int
	err := db.QueryRow(`SELECT banner_enabled, banner_mode, auto_slide_interval FROM app_settings WHERE tenant_id = $1`, tenantID).Scan(&bannerEnabled, &bannerMode, &autoSlide)
	if err != nil {
		// Return defaults if no row exists
		c.JSON(200, gin.H{"bannerEnabled": false, "bannerMode": "single", "autoSlideInterval": 5})
		return
	}
	c.JSON(200, gin.H{"bannerEnabled": bannerEnabled, "bannerMode": bannerMode, "autoSlideInterval": autoSlide})
}

func updateAppSettings(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var body struct {
		BannerEnabled     *bool   `json:"bannerEnabled"`
		BannerMode        *string `json:"bannerMode"`
		AutoSlideInterval *int    `json:"autoSlideInterval"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	// Upsert
	_, err := db.Exec(`
		INSERT INTO app_settings (tenant_id, banner_enabled, banner_mode, auto_slide_interval, updated_at)
		VALUES ($1, COALESCE($2, false), COALESCE($3, 'single'), COALESCE($4, 5), NOW())
		ON CONFLICT (tenant_id) DO UPDATE SET
			banner_enabled = COALESCE($2, app_settings.banner_enabled),
			banner_mode = COALESCE($3, app_settings.banner_mode),
			auto_slide_interval = COALESCE($4, app_settings.auto_slide_interval),
			updated_at = NOW()
	`, tenantID, body.BannerEnabled, body.BannerMode, body.AutoSlideInterval)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update settings: " + err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Settings updated"})
}

func listAppBanners(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query(`SELECT id, image_url, link_url, link_type, title, COALESCE(description, ''), sort_order, is_active,
		show_overlay, overlay_title, overlay_description, created_at
		FROM app_banners WHERE tenant_id = $1 ORDER BY sort_order ASC, created_at ASC`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type Banner struct {
		ID                 string `json:"id"`
		ImageURL           string `json:"imageUrl"`
		LinkURL            string `json:"linkUrl"`
		LinkType           string `json:"linkType"`
		Title              string `json:"title"`
		Description        string `json:"description"`
		SortOrder          int    `json:"sortOrder"`
		IsActive           bool   `json:"isActive"`
		ShowOverlay        bool   `json:"showOverlay"`
		OverlayTitle       string `json:"overlayTitle"`
		OverlayDescription string `json:"overlayDescription"`
		CreatedAt          string `json:"createdAt"`
	}
	banners := []Banner{}
	for rows.Next() {
		var b Banner
		var createdAt time.Time
		rows.Scan(&b.ID, &b.ImageURL, &b.LinkURL, &b.LinkType, &b.Title, &b.Description, &b.SortOrder, &b.IsActive,
			&b.ShowOverlay, &b.OverlayTitle, &b.OverlayDescription, &createdAt)
		b.CreatedAt = createdAt.Format(time.RFC3339)
		banners = append(banners, b)
	}
	c.JSON(200, gin.H{"banners": banners})
}

func upsertAppBanner(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var body struct {
		ImageURL           string `json:"imageUrl"`
		LinkURL            string `json:"linkUrl"`
		LinkType           string `json:"linkType"`
		Title              string `json:"title"`
		Description        string `json:"description"`
		SortOrder          int    `json:"sortOrder"`
		IsActive           bool   `json:"isActive"`
		ShowOverlay        bool   `json:"showOverlay"`
		OverlayTitle       string `json:"overlayTitle"`
		OverlayDescription string `json:"overlayDescription"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}
	if body.LinkType == "" {
		body.LinkType = "external"
	}

	id := uuid.New().String()
	_, err := db.Exec(`INSERT INTO app_banners (id, tenant_id, image_url, link_url, link_type, title, description, sort_order, is_active, show_overlay, overlay_title, overlay_description)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
		id, tenantID, body.ImageURL, body.LinkURL, body.LinkType, body.Title, body.Description, body.SortOrder, body.IsActive,
		body.ShowOverlay, body.OverlayTitle, body.OverlayDescription)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "message": "Banner created"})
}

func updateAppBanner(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	bannerID := c.Param("id")
	var body struct {
		ImageURL           *string `json:"imageUrl"`
		LinkURL            *string `json:"linkUrl"`
		LinkType           *string `json:"linkType"`
		Title              *string `json:"title"`
		Description        *string `json:"description"`
		SortOrder          *int    `json:"sortOrder"`
		IsActive           *bool   `json:"isActive"`
		ShowOverlay        *bool   `json:"showOverlay"`
		OverlayTitle       *string `json:"overlayTitle"`
		OverlayDescription *string `json:"overlayDescription"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	_, err := db.Exec(`UPDATE app_banners SET
		image_url = COALESCE($3, image_url),
		link_url = COALESCE($4, link_url),
		link_type = COALESCE($5, link_type),
		title = COALESCE($6, title),
		description = COALESCE($7, description),
		sort_order = COALESCE($8, sort_order),
		is_active = COALESCE($9, is_active),
		show_overlay = COALESCE($10, show_overlay),
		overlay_title = COALESCE($11, overlay_title),
		overlay_description = COALESCE($12, overlay_description),
		updated_at = NOW()
		WHERE id = $1 AND tenant_id = $2`,
		bannerID, tenantID, body.ImageURL, body.LinkURL, body.LinkType, body.Title, body.Description, body.SortOrder, body.IsActive,
		body.ShowOverlay, body.OverlayTitle, body.OverlayDescription)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Banner updated"})
}

func deleteAppBanner(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	bannerID := c.Param("id")
	_, err := db.Exec("DELETE FROM app_banners WHERE id = $1 AND tenant_id = $2", bannerID, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Banner deleted"})
}

// ── File Upload ────────────────────────────────────────────

func uploadFile(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "No file provided"})
		return
	}
	defer file.Close()

	// Validate file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true, ".svg": true}
	if !allowed[ext] {
		c.JSON(400, gin.H{"error": "Unsupported file type. Allowed: jpg, jpeg, png, webp, gif, svg"})
		return
	}

	// Limit to 10MB
	if header.Size > 10*1024*1024 {
		c.JSON(400, gin.H{"error": "File too large. Max 10MB"})
		return
	}

	// Generate unique filename
	id := uuid.New().String()
	filename := id + ext
	destPath := filepath.Join("./uploads", filename)

	out, err := os.Create(destPath)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		c.JSON(500, gin.H{"error": "Failed to write file"})
		return
	}

	// Return relative URL so it works with proxy and direct access
	relativeURL := fmt.Sprintf("/uploads/%s", filename)

	c.JSON(200, gin.H{
		"url":      relativeURL,
		"filename": filename,
		"size":     header.Size,
	})
}
