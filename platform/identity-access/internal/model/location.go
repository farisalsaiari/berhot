package model

// Country represents a country in the location hierarchy.
type Country struct {
	ID           string `json:"id"`
	Code         string `json:"code"`
	NameEN       string `json:"name_en"`
	NameAR       string `json:"name_ar"`
	PhoneCode    string `json:"phone_code"`
	CurrencyCode string `json:"currency_code"`
	FlagEmoji    string `json:"flag_emoji"`
	IsActive     bool   `json:"is_active"`
	SortOrder    int    `json:"sort_order"`
}

// Region represents an administrative region within a country.
type Region struct {
	ID        string `json:"id"`
	CountryID string `json:"country_id"`
	Code      string `json:"code"`
	NameEN    string `json:"name_en"`
	NameAR    string `json:"name_ar"`
	IsActive  bool   `json:"is_active"`
	SortOrder int    `json:"sort_order"`
}

// City represents a city within a region.
type City struct {
	ID        string `json:"id"`
	RegionID  string `json:"region_id"`
	CountryID string `json:"country_id"`
	NameEN    string `json:"name_en"`
	NameAR    string `json:"name_ar"`
	IsActive  bool   `json:"is_active"`
	SortOrder int    `json:"sort_order"`
}
