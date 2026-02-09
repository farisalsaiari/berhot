package handler

import (
	"database/sql"

	"github.com/berhot/platform/identity-access/internal/config"
	"github.com/berhot/platform/identity-access/internal/model"
	"github.com/gin-gonic/gin"
)

// LocationHandler handles country / region / city lookups.
type LocationHandler struct {
	DB  *sql.DB
	Cfg *config.Config
}

// GET /api/v1/locations/countries
func (h *LocationHandler) HandleListCountries(c *gin.Context) {
	rows, err := h.DB.Query(
		`SELECT id, code, name_en, name_ar, phone_code, currency_code, flag_emoji, is_active, sort_order
		 FROM countries
		 WHERE is_active = true
		 ORDER BY sort_order, name_en`,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": err.Error()})
		return
	}
	defer rows.Close()

	countries := []model.Country{}
	for rows.Next() {
		var ct model.Country
		if err := rows.Scan(&ct.ID, &ct.Code, &ct.NameEN, &ct.NameAR, &ct.PhoneCode, &ct.CurrencyCode, &ct.FlagEmoji, &ct.IsActive, &ct.SortOrder); err != nil {
			c.JSON(500, gin.H{"error": "Scan error", "details": err.Error()})
			return
		}
		countries = append(countries, ct)
	}

	c.JSON(200, gin.H{"countries": countries})
}

// GET /api/v1/locations/countries/:code/regions
func (h *LocationHandler) HandleListRegions(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(400, gin.H{"error": "Country code is required"})
		return
	}

	rows, err := h.DB.Query(
		`SELECT r.id, r.country_id, r.code, r.name_en, r.name_ar, r.is_active, r.sort_order
		 FROM regions r
		 JOIN countries ct ON ct.id = r.country_id
		 WHERE ct.code = $1 AND r.is_active = true
		 ORDER BY r.sort_order, r.name_en`,
		code,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": err.Error()})
		return
	}
	defer rows.Close()

	regions := []model.Region{}
	for rows.Next() {
		var rg model.Region
		if err := rows.Scan(&rg.ID, &rg.CountryID, &rg.Code, &rg.NameEN, &rg.NameAR, &rg.IsActive, &rg.SortOrder); err != nil {
			c.JSON(500, gin.H{"error": "Scan error", "details": err.Error()})
			return
		}
		regions = append(regions, rg)
	}

	c.JSON(200, gin.H{"regions": regions})
}

// GET /api/v1/locations/regions/:id/cities
func (h *LocationHandler) HandleListCities(c *gin.Context) {
	regionID := c.Param("id")
	if regionID == "" {
		c.JSON(400, gin.H{"error": "Region ID is required"})
		return
	}

	rows, err := h.DB.Query(
		`SELECT id, region_id, country_id, name_en, name_ar, is_active, sort_order
		 FROM cities
		 WHERE region_id = $1 AND is_active = true
		 ORDER BY sort_order, name_en`,
		regionID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error", "details": err.Error()})
		return
	}
	defer rows.Close()

	cities := []model.City{}
	for rows.Next() {
		var ci model.City
		if err := rows.Scan(&ci.ID, &ci.RegionID, &ci.CountryID, &ci.NameEN, &ci.NameAR, &ci.IsActive, &ci.SortOrder); err != nil {
			c.JSON(500, gin.H{"error": "Scan error", "details": err.Error()})
			return
		}
		cities = append(cities, ci)
	}

	c.JSON(200, gin.H{"cities": cities})
}
