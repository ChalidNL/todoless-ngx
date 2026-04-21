#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/data/home/todoless-ngx"
APPDATA_DIR="/DATA/AppData/todoless-ngx"
BACKUP_ROOT="$APPDATA_DIR/backups/invite-fix"
COMPOSE_FILE="$REPO_DIR/docker-compose.yml"
FRONTEND_CONTAINER="todoless-ngx"
POCKETBASE_CONTAINER="todoless-ngx-pocketbase"

BACKUP_DIR=""
RESTORE_DATA="false"

log() { printf '[rollback-invite-fix] %s\n' "$*"; }
err() { printf '[rollback-invite-fix][ERROR] %s\n' "$*" >&2; }

usage() {
  cat <<'EOF'
Usage: rollback-invite-fix.sh [options]

Options:
  --backup-dir <path>   Explicit backup dir (default: read from .last_backup)
  --restore-data        Also restore pb_data and pb_migrations from backup
  -h, --help            Show help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backup-dir) BACKUP_DIR="${2:-}"; shift 2 ;;
    --restore-data) RESTORE_DATA="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) err "Unknown argument: $1"; usage; exit 1 ;;
  esac
done

require_cmd() { command -v "$1" >/dev/null 2>&1 || { err "Missing command: $1"; exit 1; }; }

resolve_backup_dir() {
  if [[ -n "$BACKUP_DIR" ]]; then
    [[ -d "$BACKUP_DIR" ]] || { err "Backup dir not found: $BACKUP_DIR"; exit 1; }
    return
  fi

  [[ -f "$BACKUP_ROOT/.last_backup" ]] || { err "No .last_backup found in $BACKUP_ROOT"; exit 1; }
  BACKUP_DIR="$(cat "$BACKUP_ROOT/.last_backup")"
  [[ -d "$BACKUP_DIR" ]] || { err "Resolved backup dir missing: $BACKUP_DIR"; exit 1; }
}

source_metadata() {
  local meta="$BACKUP_DIR/release-metadata.env"
  [[ -f "$meta" ]] || { err "Metadata file missing: $meta"; exit 1; }
  # shellcheck disable=SC1090
  source "$meta"

  [[ -n "${frontend_image_before:-}" ]] || { err "frontend_image_before missing in metadata"; exit 1; }
  [[ -n "${pocketbase_image_before:-}" ]] || { err "pocketbase_image_before missing in metadata"; exit 1; }
}

restore_compose_images() {
  log "Restoring compose image tags from metadata"

  python3 - <<PY
from pathlib import Path
p = Path("$COMPOSE_FILE")
s = p.read_text()
# Replace first image (frontend service)
if "    image:" not in s:
    raise SystemExit("No image lines found in compose file")

# Deterministic replacements for current compose layout
s = s.replace("    image: ghcr.io/chalidnl/todoless-ngx:latest", "    image: ${frontend_image_before}", 1)
s = s.replace("    image: ghcr.io/muchobien/pocketbase:0.34.2", "    image: ${pocketbase_image_before}", 1)
p.write_text(s)
PY
}

restore_data() {
  log "Restoring PocketBase data from $BACKUP_DIR"
  [[ -d "$BACKUP_DIR/pb_data" ]] || { err "Missing backup pb_data"; exit 1; }
  [[ -d "$BACKUP_DIR/pb_migrations" ]] || { err "Missing backup pb_migrations"; exit 1; }

  cd "$REPO_DIR"
  docker compose -f "$COMPOSE_FILE" stop pocketbase || true

  rm -rf "$APPDATA_DIR/pb_data" "$APPDATA_DIR/pb_migrations"
  cp -a "$BACKUP_DIR/pb_data" "$APPDATA_DIR/"
  cp -a "$BACKUP_DIR/pb_migrations" "$APPDATA_DIR/"
}

redeploy() {
  cd "$REPO_DIR"
  log "Pulling rollback images"
  docker compose -f "$COMPOSE_FILE" pull
  log "Starting services"
  docker compose -f "$COMPOSE_FILE" up -d
  docker compose -f "$COMPOSE_FILE" ps
}

postcheck() {
  log "Post-rollback checks"
  curl -fsS http://127.0.0.1:7070/ >/dev/null || { err "Frontend health failed after rollback"; exit 1; }
  docker exec "$POCKETBASE_CONTAINER" sh -lc "wget -qO- http://127.0.0.1:8090/api/health || curl -fsSL http://127.0.0.1:8090/api/health" >/dev/null || { err "PocketBase health failed after rollback"; exit 1; }

  docker logs --tail 80 "$FRONTEND_CONTAINER" || true
  docker logs --tail 80 "$POCKETBASE_CONTAINER" || true

  log "Rollback successful"
}

main() {
  require_cmd docker
  require_cmd curl
  require_cmd python3

  resolve_backup_dir
  source_metadata
  restore_compose_images

  if [[ "$RESTORE_DATA" == "true" ]]; then
    restore_data
  fi

  redeploy
  postcheck
}

main "$@"
