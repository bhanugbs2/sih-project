# PowerShell script to restore a PostgreSQL database backup for HoneyChain (SIH26021)
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbUser = "postgres",
    [string]$DbName = "honeychain_db",
    [string]$ContainerName = "honeychain-postgres",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Red
Write-Host " HoneyChain Database Restore Utility (PostgreSQL) " -ForegroundColor Red
Write-Host "==================================================" -ForegroundColor Red

if (-not (Test-Path $BackupFile)) {
    Write-Host "[ERROR] Specified backup file does not exist: $BackupFile" -ForegroundColor Red
    exit 1
}

if (-not $Force) {
    $Confirmation = Read-Host "WARNING: Restoring will overwrite existing data in '$DbName'. Type 'YES' to proceed"
    if ($Confirmation -ne "YES") {
        Write-Host "Restore operation cancelled by user." -ForegroundColor Yellow
        exit 0
    }
}

# Check if Docker container is running
$DockerRunning = $false
try {
    $ContainerCheck = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
    if ($ContainerCheck -eq $ContainerName) {
        $DockerRunning = $true
    }
} catch {}

if ($DockerRunning) {
    Write-Host "Restoring backup into Docker container '$ContainerName'..." -ForegroundColor Yellow
    Get-Content $BackupFile | docker exec -i $ContainerName psql -U $DbUser -d $DbName
} else {
    Write-Host "Restoring backup into local database $DbHost:$DbPort/$DbName..." -ForegroundColor Yellow
    $env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
    psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $BackupFile
}

Write-Host "[SUCCESS] Database restoration complete!" -ForegroundColor Green
Write-Host "Target Database: $DbName" -ForegroundColor Green
Write-Host "Source File: $BackupFile" -ForegroundColor Green
