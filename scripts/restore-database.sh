#!/usr/bin/env bash
# Bash script to restore a PostgreSQL database backup for HoneyChain (SIH26021)

set -e

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-honeychain_db}"
CONTAINER_NAME="honeychain-postgres"

echo "=================================================="
echo " HoneyChain Database Restore Utility (PostgreSQL) "
echo "=================================================="

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file path required as 1st argument and file must exist!"
    echo "Usage: ./restore-database.sh <path_to_backup.sql>"
    exit 1
fi

if docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -q "${CONTAINER_NAME}"; then
    echo "Restoring backup into Docker container '${CONTAINER_NAME}'..."
    cat "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"
else
    echo "Restoring backup into local database ${DB_HOST}:${DB_PORT}/${DB_NAME}..."
    export PGPASSWORD="${DB_PASSWORD:-postgres}"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${BACKUP_FILE}"
fi

echo "[SUCCESS] Database restoration complete!"
echo "Target Database: ${DB_NAME}"
echo "Source File: ${BACKUP_FILE}"
