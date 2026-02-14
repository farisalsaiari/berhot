-- ============================================================
-- 010_migrate_upload_paths.sql — Reorganize upload paths
-- ============================================================
-- Moves upload URLs from flat structure to asset-type subdirectories:
--   /uploads/tenants/{id}/logo_xxx.png  → /uploads/tenants/{id}/logos/logo_xxx.png
--   /uploads/tenants/{id}/cover_xxx.jpg → /uploads/tenants/{id}/covers/cover_xxx.jpg
--
-- IMPORTANT: Run the companion shell script (migrate_uploads.sh) BEFORE
-- this migration to physically move the files on disk.
-- ============================================================

-- Update logo_url paths: insert /logos/ before the filename
UPDATE tenants
SET    logo_url = regexp_replace(logo_url, '^(/uploads/tenants/[^/]+)/(.+)$', '\1/logos/\2'),
       updated_at = NOW()
WHERE  logo_url IS NOT NULL
  AND  logo_url != ''
  AND  logo_url NOT LIKE '%/logos/%';

-- Update cover_url paths: insert /covers/ before the filename
UPDATE tenants
SET    cover_url = regexp_replace(cover_url, '^(/uploads/tenants/[^/]+)/(.+)$', '\1/covers/\2'),
       updated_at = NOW()
WHERE  cover_url IS NOT NULL
  AND  cover_url != ''
  AND  cover_url NOT LIKE '%/covers/%';
