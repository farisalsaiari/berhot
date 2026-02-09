-- ============================================================
-- 007_locations.sql — Countries, Regions, Cities
-- ============================================================
-- Provides location data for business registration and
-- multi-country expansion. Default: Saudi Arabia.
-- ============================================================

-- ── Countries ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS countries (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(2)   NOT NULL UNIQUE,          -- ISO 3166-1 alpha-2
    name_en       VARCHAR(100) NOT NULL,
    name_ar       VARCHAR(100) NOT NULL DEFAULT '',
    phone_code    VARCHAR(10)  NOT NULL DEFAULT '',       -- e.g. +966
    currency_code VARCHAR(3)   NOT NULL DEFAULT '',       -- e.g. SAR
    flag_emoji    VARCHAR(10)  NOT NULL DEFAULT '',       -- e.g. 🇸🇦
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    sort_order    INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Regions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS regions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id    UUID         NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    code          VARCHAR(10)  NOT NULL,                  -- e.g. 01 for Riyadh
    name_en       VARCHAR(100) NOT NULL,
    name_ar       VARCHAR(100) NOT NULL DEFAULT '',
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    sort_order    INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(country_id, code)
);

-- ── Cities ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id     UUID         NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    country_id    UUID         NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name_en       VARCHAR(100) NOT NULL,
    name_ar       VARCHAR(100) NOT NULL DEFAULT '',
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    sort_order    INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_regions_country_id ON regions(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_region_id   ON cities(region_id);
CREATE INDEX IF NOT EXISTS idx_cities_country_id  ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_countries_active    ON countries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_regions_active      ON regions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cities_active       ON cities(is_active) WHERE is_active = true;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  SEED DATA — Saudi Arabia                                  ║
-- ╚════════════════════════════════════════════════════════════╝

-- Country
INSERT INTO countries (id, code, name_en, name_ar, phone_code, currency_code, flag_emoji, is_active, sort_order)
VALUES ('a0000000-0000-4000-8000-000000000001', 'SA', 'Saudi Arabia', 'المملكة العربية السعودية', '+966', 'SAR', '🇸🇦', true, 1)
ON CONFLICT (code) DO NOTHING;

-- ── Regions (13 administrative regions) ─────────────────────
INSERT INTO regions (id, country_id, code, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '01', 'Riyadh',            'الرياض',          1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', '02', 'Makkah',            'مكة المكرمة',      2),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', '03', 'Madinah',           'المدينة المنورة',   3),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', '04', 'Eastern Province',  'المنطقة الشرقية',   4),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', '05', 'Asir',              'عسير',             5),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', '06', 'Tabuk',             'تبوك',             6),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', '07', 'Hail',              'حائل',             7),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', '08', 'Northern Borders',  'الحدود الشمالية',   8),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', '09', 'Jazan',             'جازان',            9),
  ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', '10', 'Najran',            'نجران',            10),
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', '11', 'Al Bahah',          'الباحة',           11),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', '12', 'Al Jawf',           'الجوف',            12),
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', '13', 'Qassim',            'القصيم',           13)
ON CONFLICT (country_id, code) DO NOTHING;

-- ── Cities ──────────────────────────────────────────────────
-- Riyadh Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Riyadh',       'الرياض',       1),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Kharj',        'الخرج',        2),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Diriyah',      'الدرعية',      3),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Dawadmi',      'الدوادمي',     4),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Majmaah',      'المجمعة',      5),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Wadi ad-Dawasir', 'وادي الدواسر', 6);

-- Makkah Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Jeddah',       'جدة',          1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Mecca',        'مكة المكرمة',   2),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Taif',         'الطائف',       3),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Rabigh',       'رابغ',         4),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Qunfudhah',    'القنفذة',      5);

-- Madinah Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Medina',       'المدينة المنورة', 1),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Yanbu',        'ينبع',          2),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Al Ula',       'العلا',         3);

-- Eastern Province
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Dammam',       'الدمام',       1),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Khobar',       'الخبر',        2),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Dhahran',      'الظهران',      3),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Jubail',       'الجبيل',       4),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Hofuf',        'الهفوف',       5),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Qatif',        'القطيف',       6);

-- Asir Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Abha',         'أبها',         1),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Khamis Mushait','خميس مشيط',   2),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Bisha',        'بيشة',         3);

-- Tabuk Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Tabuk',        'تبوك',         1),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'NEOM',         'نيوم',         2);

-- Hail Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'Hail',         'حائل',         1);

-- Northern Borders
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'Arar',         'عرعر',         1),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'Rafha',        'رفحاء',        2);

-- Jazan Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'Jazan',        'جازان',        1),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 'Sabya',        'صبيا',         2);

-- Najran Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'Najran',       'نجران',        1);

-- Al Bahah Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'Al Bahah',     'الباحة',       1);

-- Al Jawf Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'Sakaka',       'سكاكا',        1),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'Dumat al-Jandal','دومة الجندل', 2);

-- Qassim Region
INSERT INTO cities (region_id, country_id, name_en, name_ar, sort_order) VALUES
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', 'Buraydah',     'بريدة',        1),
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', 'Unaizah',      'عنيزة',        2);

-- ── Add country_code to tenants table ───────────────────────
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'SA';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);
