#!/usr/bin/env bash
# Bash script to perform a full PostgreSQL backup for HoneyChain (SIH26021)

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-honeychain_db}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
CONTAINER_NAME="honeychain-postgres"

echo "=================================================="
echo " HoneyChain Database Backup Utility (PostgreSQL) "
echo "=================================================="

mkdir -p "${BACKUP_DIR}"

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/honeychain-backup-${TIMESTAMP}.sql"

if docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -q "${CONTAINER_NAME}"; then
    echo "Executing pg_dump via Docker container: ${CONTAINER_NAME}..."
    docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists > "${BACKUP_FILE}"
else
    echo "Executing local pg_dump on ${DB_HOST}:${DB_PORT}..."
    export PGPASSWORD="${DB_PASSWORD:-postgres}"
    pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists -f "${BACKUP_FILE}"
fi

if [ -f "${BACKUP_FILE}" ]; then
    FILE_SIZE=$(wc -c <"${BACKUP_FILE}")
    echo "[SUCCESS] Backup created successfully!"
    echo "File: ${BACKUP_FILE} (${FILE_SIZE} bytes)"
else
    echo "[ERROR] Backup file was not created!"
    exit 1
fi
