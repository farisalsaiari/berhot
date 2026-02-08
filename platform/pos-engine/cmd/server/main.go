package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
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
		port = "8081"
	}

	dbURL := getEnv("DATABASE_URL", "postgres://berhot:berhot_dev_password@localhost:5432/berhot_dev?sslmode=disable")
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

	router := gin.Default()

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
	// Tenant context comes from X-Tenant-ID header (set by API gateway/auth middleware)
	v1.Use(tenantMiddleware())
	{
		v1.GET("/products", listProducts)
		v1.POST("/products", createProduct)
		v1.GET("/products/:id", getProduct)
		v1.PUT("/products/:id", updateProduct)

		v1.GET("/categories", listCategories)
		v1.POST("/categories", createCategory)

		v1.GET("/locations", listLocations)

		v1.POST("/orders", createOrder)
		v1.GET("/orders", listOrders)
		v1.GET("/orders/:id", getOrder)
		v1.PUT("/orders/:id/status", updateOrderStatus)
		v1.POST("/orders/:id/complete", completeOrder)
		v1.POST("/orders/:id/cancel", cancelOrder)

		v1.POST("/payments", processPayment)
		v1.GET("/payments/:orderId", getOrderPayments)

		v1.GET("/customers", listCustomers)
		v1.POST("/customers", createCustomer)

		v1.GET("/inventory", listInventory)
		v1.PUT("/inventory/:productId", updateInventory)

		v1.GET("/reports/daily-sales", getDailySales)
		v1.GET("/reports/top-products", getTopProducts)
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
			// For MVP, use demo tenant as default
			tenantID = "10000000-0000-0000-0000-000000000001"
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
		        COALESCE(c.name, '') as category_name, p.category_id, p.created_at
		 FROM products p
		 LEFT JOIN categories c ON c.id = p.category_id
		 WHERE p.tenant_id = $1
		 ORDER BY p.name`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	products := []gin.H{}
	for rows.Next() {
		var id, name, sku, currency, ptype, desc, barcode, catName string
		var catID sql.NullString
		var price float64
		var active bool
		var createdAt time.Time
		rows.Scan(&id, &name, &sku, &price, &currency, &ptype, &active, &desc, &barcode, &catName, &catID, &createdAt)
		products = append(products, gin.H{
			"id": id, "name": name, "sku": sku, "price": price, "currency": currency,
			"type": ptype, "isActive": active, "description": desc, "barcode": barcode,
			"categoryName": catName, "categoryId": catID.String, "createdAt": createdAt,
		})
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
		`INSERT INTO products (id, tenant_id, category_id, sku, name, description, price, currency, tax_rate, product_type, is_active)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, 'SAR', $8, $9, true)`,
		id, tenantID, catID, req.SKU, req.Name, req.Description, req.Price, req.TaxRate, req.ProductType,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "name": req.Name, "sku": req.SKU, "price": req.Price})
}

func getProduct(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	var name, sku, currency, ptype string
	var price, taxRate float64
	var active bool
	err := db.QueryRow(
		"SELECT name, sku, price, currency, product_type, COALESCE(tax_rate,0), is_active FROM products WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	).Scan(&name, &sku, &price, &currency, &ptype, &taxRate, &active)
	if err != nil {
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(200, gin.H{"id": id, "name": name, "sku": sku, "price": price, "currency": currency, "type": ptype, "taxRate": taxRate, "isActive": active})
}

func updateProduct(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")
	var req struct {
		Name        string   `json:"name"`
		Price       *float64 `json:"price"`
		IsActive    *bool    `json:"isActive"`
		Description string   `json:"description"`
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
			description = COALESCE(NULLIF($4,''), description)
		 WHERE id = $5 AND tenant_id = $6`,
		req.Name, req.Price, req.IsActive, req.Description, id, tenantID,
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

// ── Categories ──────────────────────────────────────────────

func listCategories(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	rows, err := db.Query("SELECT id, name, slug, sort_order, is_active FROM categories WHERE tenant_id = $1 ORDER BY sort_order", tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	cats := []gin.H{}
	for rows.Next() {
		var id, name, slug string
		var sortOrder int
		var active bool
		rows.Scan(&id, &name, &slug, &sortOrder, &active)
		cats = append(cats, gin.H{"id": id, "name": name, "slug": slug, "sortOrder": sortOrder, "isActive": active})
	}
	c.JSON(200, gin.H{"categories": cats, "total": len(cats)})
}

func createCategory(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	var req struct {
		Name      string `json:"name" binding:"required"`
		Slug      string `json:"slug"`
		SortOrder int    `json:"sortOrder"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.Slug == "" {
		req.Slug = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	}
	id := uuid.New().String()
	_, err := db.Exec("INSERT INTO categories (id, tenant_id, name, slug, sort_order) VALUES ($1,$2,$3,$4,$5)",
		id, tenantID, req.Name, req.Slug, req.SortOrder)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": id, "name": req.Name, "slug": req.Slug})
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
		LocationID string `json:"locationId" binding:"required"`
		OrderType  string `json:"orderType"`
		Items      []struct {
			ProductID string  `json:"productId" binding:"required"`
			Quantity  float64 `json:"quantity" binding:"required"`
			Notes     string  `json:"notes"`
		} `json:"items" binding:"required,min=1"`
		CustomerID string `json:"customerId"`
		Notes      string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.OrderType == "" {
		req.OrderType = "dine_in"
	}

	// Calculate totals from DB prices
	var subtotal, taxTotal float64
	type itemCalc struct {
		productID string
		name      string
		price     float64
		taxRate   float64
		quantity  float64
		notes     string
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
		lineTotal := price * item.Quantity
		lineTax := lineTotal * taxRate / 100
		subtotal += lineTotal
		taxTotal += lineTax
		items = append(items, itemCalc{item.ProductID, name, price, taxRate, item.Quantity, item.Notes})
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
		itemTax := item.price * item.quantity * item.taxRate / 100
		itemTotal := item.price*item.quantity + itemTax
		_, err = tx.Exec(
			`INSERT INTO order_items (id, tenant_id, order_id, product_id, name, quantity, unit_price, tax_amount, total_price, notes)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			itemID, tenantID, orderID, item.productID, item.name, item.quantity, item.price, itemTax, itemTotal, item.notes,
		)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		orderItems = append(orderItems, gin.H{
			"id": itemID, "productId": item.productID, "name": item.name,
			"quantity": item.quantity, "unitPrice": item.price, "taxAmount": itemTax, "totalPrice": itemTotal,
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

	query := "SELECT id, order_number, status, order_type, subtotal, tax_amount, total, currency, created_at FROM orders WHERE tenant_id = $1"
	args := []interface{}{tenantID}
	if status != "" {
		query += " AND status = $2"
		args = append(args, status)
	}
	query += " ORDER BY created_at DESC LIMIT 50"

	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	orders := []gin.H{}
	for rows.Next() {
		var id, num, st, ot, cur string
		var sub, tax, tot float64
		var createdAt time.Time
		rows.Scan(&id, &num, &st, &ot, &sub, &tax, &tot, &cur, &createdAt)
		orders = append(orders, gin.H{
			"id": id, "orderNumber": num, "status": st, "orderType": ot,
			"subtotal": sub, "taxAmount": tax, "total": tot, "currency": cur, "createdAt": createdAt,
		})
	}
	c.JSON(200, gin.H{"orders": orders, "total": len(orders)})
}

func getOrder(c *gin.Context) {
	tenantID := c.GetString("tenantId")
	id := c.Param("id")

	var num, st, ot, cur string
	var sub, tax, tot float64
	var createdAt time.Time
	err := db.QueryRow(
		"SELECT order_number, status, order_type, subtotal, tax_amount, total, currency, created_at FROM orders WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	).Scan(&num, &st, &ot, &sub, &tax, &tot, &cur, &createdAt)
	if err != nil {
		c.JSON(404, gin.H{"error": "Order not found"})
		return
	}

	// Get items
	rows, _ := db.Query("SELECT id, product_id, name, quantity, unit_price, tax_amount, total_price FROM order_items WHERE order_id = $1 AND tenant_id = $2", id, tenantID)
	defer rows.Close()
	items := []gin.H{}
	for rows.Next() {
		var iid, pid, iname string
		var qty, up, itax, itot float64
		rows.Scan(&iid, &pid, &iname, &qty, &up, &itax, &itot)
		items = append(items, gin.H{"id": iid, "productId": pid, "name": iname, "quantity": qty, "unitPrice": up, "taxAmount": itax, "totalPrice": itot})
	}

	c.JSON(200, gin.H{
		"id": id, "orderNumber": num, "status": st, "orderType": ot,
		"subtotal": sub, "taxAmount": tax, "total": tot, "currency": cur,
		"items": items, "createdAt": createdAt,
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
	res, _ := db.Exec("UPDATE orders SET status = 'cancelled' WHERE id = $1 AND tenant_id = $2 AND status = 'pending'", id, tenantID)
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

	// Auto-complete the order
	db.Exec("UPDATE orders SET status = 'completed', completed_at = NOW() WHERE id = $1 AND tenant_id = $2", req.OrderID, tenantID)

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

	c.JSON(200, gin.H{
		"date": date, "totalOrders": totalOrders,
		"totalRevenue": totalRevenue, "totalTax": totalTax,
		"currency": "SAR",
	})
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

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
