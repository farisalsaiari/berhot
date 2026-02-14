#!/usr/bin/env bash
# ============================================================
# migrate_uploads.sh — Move existing upload files into
# asset-type subdirectories (logos/, covers/)
# ============================================================
# Run this BEFORE the SQL migration (010_migrate_upload_paths.sql)
#
# Usage:
#   cd platform/identity-access
#   bash ../../ops/scripts/migrate_uploads.sh
#
# Structure change:
#   uploads/tenants/{id}/logo_xxx.png  → uploads/tenants/{id}/logos/logo_xxx.png
#   uploads/tenants/{id}/cover_xxx.jpg → uploads/tenants/{id}/covers/cover_xxx.jpg
# ============================================================

set -euo pipefail

UPLOADS_ROOT="uploads/tenants"

if [ ! -d "$UPLOADS_ROOT" ]; then
  echo "No uploads directory found at $UPLOADS_ROOT — nothing to migrate."
  exit 0
fi

moved=0
skipped=0

for tenant_dir in "$UPLOADS_ROOT"/*/; do
  [ -d "$tenant_dir" ] || continue

  tenant_id=$(basename "$tenant_dir")
  echo "Processing tenant: $tenant_id"

  # Move logo files into logos/ subdirectory
  for file in "$tenant_dir"logo_*; do
    [ -f "$file" ] || continue
    mkdir -p "${tenant_dir}logos"
    filename=$(basename "$file")
    if [ -f "${tenant_dir}logos/$filename" ]; then
      echo "  SKIP (already exists): logos/$filename"
      ((skipped++)) || true
    else
      mv "$file" "${tenant_dir}logos/$filename"
      echo "  MOVED: $filename → logos/$filename"
      ((moved++)) || true
    fi
  done

  # Move cover files into covers/ subdirectory
  for file in "$tenant_dir"cover_*; do
    [ -f "$file" ] || continue
    mkdir -p "${tenant_dir}covers"
    filename=$(basename "$file")
    if [ -f "${tenant_dir}covers/$filename" ]; then
      echo "  SKIP (already exists): covers/$filename"
      ((skipped++)) || true
    else
      mv "$file" "${tenant_dir}covers/$filename"
      echo "  MOVED: $filename → covers/$filename"
      ((moved++)) || true
    fi
  done
done

echo ""
echo "Migration complete: $moved files moved, $skipped skipped."
