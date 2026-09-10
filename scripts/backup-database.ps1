# PowerShell script to perform a full PostgreSQL backup for HoneyChain (SIH26021)
param (
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbUser = "postgres",
    [string]$DbName = "honeychain_db",
    [string]$BackupDir = "$PSScriptRoot\..\backups",
    [string]$ContainerName = "honeychain-postgres"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " HoneyChain Database Backup Utility (PostgreSQL) " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Create backup directory if it does not exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Green
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupFile = Join-Path $BackupDir "honeychain-backup-$Timestamp.sql"

# Check if Docker container is running
$DockerRunning = $false
try {
    $ContainerCheck = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
    if ($ContainerCheck -eq $ContainerName) {
        $DockerRunning = $true
    }
} catch {}

if ($DockerRunning) {
    Write-Host "Executing pg_dump via Docker container: $ContainerName..." -ForegroundColor Yellow
    docker exec $ContainerName pg_dump -U $DbUser -d $DbName --clean --if-exists > $BackupFile
} else {
    Write-Host "Executing local pg_dump on $DbHost:$DbPort..." -ForegroundColor Yellow
    $env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
    pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName --clean --if-exists -f $BackupFile
}

if (Test-Path $BackupFile) {
    $FileSize = (Get-Item $BackupFile).Length
    Write-Host "[SUCCESS] Backup created successfully!" -ForegroundColor Green
    Write-Host "File: $BackupFile ($FileSize bytes)" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Backup file was not created!" -ForegroundColor Red
    exit 1
}
