# PowerShell script to perform a full system regression check for HoneyChain (SIH26021)
param (
    [switch]$SkipMobile
)

$ErrorActionPreference = "Continue"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " HoneyChain Local System Verification Utility     " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$Results = @{}
$ProjectRoot = "$PSScriptRoot\.."

# 1. Blockchain EVM Smart Contract Tests
Write-Host "`n[1/4] Running Hardhat EVM Contract Tests..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\blockchain"
npx hardhat test
if ($LASTEXITCODE -eq 0) {
    $Results["Blockchain"] = "PASS"
    Write-Host "[PASS] Blockchain tests passed!" -ForegroundColor Green
} else {
    $Results["Blockchain"] = "FAIL"
    Write-Host "[FAIL] Blockchain tests failed!" -ForegroundColor Red
}
Pop-Location

# 2. Backend Spring Boot Maven Tests
Write-Host "`n[2/4] Running Spring Boot Backend Tests..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\backend"
.\mvnw.cmd clean test
if ($LASTEXITCODE -eq 0) {
    $Results["Backend"] = "PASS"
    Write-Host "[PASS] Backend tests passed!" -ForegroundColor Green
} else {
    $Results["Backend"] = "FAIL"
    Write-Host "[FAIL] Backend tests failed!" -ForegroundColor Red
}
Pop-Location

# 3. Frontend React Build
Write-Host "`n[3/4] Running React Frontend Production Build..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\frontend"
npm run build
if ($LASTEXITCODE -eq 0) {
    $Results["Frontend"] = "PASS"
    Write-Host "[PASS] Frontend build passed!" -ForegroundColor Green
} else {
    $Results["Frontend"] = "FAIL"
    Write-Host "[FAIL] Frontend build failed!" -ForegroundColor Red
}
Pop-Location

# 4. Flutter Mobile Analysis & Tests
if (-not $SkipMobile) {
    Write-Host "`n[4/4] Running Flutter Mobile Analysis & Tests..." -ForegroundColor Yellow
    Push-Location "$ProjectRoot\mobile"
    flutter test
    if ($LASTEXITCODE -eq 0) {
        $Results["Mobile"] = "PASS"
        Write-Host "[PASS] Mobile tests passed!" -ForegroundColor Green
    } else {
        $Results["Mobile"] = "FAIL"
        Write-Host "[FAIL] Mobile tests failed!" -ForegroundColor Red
    }
    Pop-Location
} else {
    $Results["Mobile"] = "SKIPPED"
}

# Summary Table
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "           SYSTEM VERIFICATION SUMMARY            " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

foreach ($Module in $Results.Keys) {
    $Status = $Results[$Module]
    $Color = if ($Status -eq "PASS") { "Green" } elseif ($Status -eq "SKIPPED") { "Yellow" } else { "Red" }
    Write-Host ("{0,-15} : {1}" -f $Module, $Status) -ForegroundColor $Color
}

$Failed = $Results.Values | Where-Object { $_ -eq "FAIL" }
if ($Failed) {
    Write-Host "`n[OVERALL RESULT] SYSTEM VERIFICATION FAILED!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n[OVERALL RESULT] ALL SYSTEM CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
    exit 0
}
