# HoneyChain Disaster Recovery & Business Continuity Plan

**Project**: HoneyChain — Blockchain-based Honey Traceability & Smart Beekeeping Management System  
**Problem Statement**: SIH26021  
**Team**: Nexora  

---

## 1. Overview & Policy Objective

This document defines the Disaster Recovery (DR) and Business Continuity procedures for the **HoneyChain** platform. The objective is to ensure rapid restoration of core services, guarantee cryptographic batch data integrity, maintain QR code verification availability, and clearly delineate database recovery procedures from EVM blockchain immutability constraints.

---

## 2. Backup Frequency & Storage Policy

| Data Asset | Backup Frequency | Storage Location | Retention Period | Tooling |
|---|---|---|---|---|
| **PostgreSQL Database** | Daily Automated / Pre-Deployment | Off-site encrypted volume / S3 Bucket | 30 Days | `scripts/backup-database.ps1` (`pg_dump`) |
| **Flyway Schema Migrations** | On Git Commit | Version Control (`backend/src/main/resources/db/migration`) | Permanent | Git Repository |
| **Docker Images** | Per Release Tag | Internal Container Registry | Last 5 Versions | Multi-stage Dockerfiles |
| **Environment Specs** | Immutable Templates | Version Control (`.env.example`) | Permanent | Git Repository |

---

## 3. Database Disaster Recovery Procedure

In the event of database corruption, hardware failure, or data loss:

### Step 1: Isolate & Stop Dependent Application Services
Stop backend containers to prevent partial state writes:
```bash
docker-compose stop backend
```

### Step 2: Provision / Clean Target PostgreSQL Instance
Ensure target PostgreSQL database is reachable and empty or ready for restoration.

### Step 3: Execute Restoration Script
Use the automated restore utility:
```powershell
# Windows PowerShell
.\scripts\restore-database.ps1 -BackupFile "backups\honeychain-backup-20260910-104500.sql" -Force
```
```bash
# Linux / macOS Bash
./scripts/restore-database.sh backups/honeychain-backup-20260910-104500.sql
```

### Step 4: Verify Database Integrity & Flyway Schema State
Verify restored table counts and Flyway migration state:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM hives;
SELECT COUNT(*) FROM honey_batches;
SELECT COUNT(*) FROM quality_tests;
SELECT COUNT(*) FROM packages;
SELECT COUNT(*) FROM traceability_events;
SELECT * FROM flyway_schema_history;
```

### Step 5: Restart Backend Service & Run Health Check
```bash
docker-compose start backend
curl -s http://localhost:8080/api/health
```

---

## 4. Blockchain Immutability Boundary & Discrepancy Handling

> [!IMPORTANT]
> **Fundamental Blockchain Constraint**:
> EVM Smart Contract transactions (`HoneyTraceability.sol`) recorded on-chain are **permanently immutable** and **cannot be deleted, rolled back, or overwritten**.

### Database vs. Blockchain Synchronization Rules:
1. **Restored Database to Earlier Point**:
   - If the database is restored to a backup taken prior to an EVM transaction, the smart contract on-chain ledger will still contain the recorded event hash.
   - The backend `BlockchainService` handles hash matching dynamically: if an on-chain transaction hash exists on the EVM node, querying the block hash via Web3j retrieves the immutable on-chain record.
2. **Lost Transaction Hashes**:
   - Blockchain transactions cannot simply be recreated with identical transaction hashes.
   - New traceability events generated after database restoration will receive new transaction hashes.
   - The SHA-256 event hash payload (`batchId + status + timestamp + inspectorId`) remains mathematically deterministic and verifiable off-chain.

---

## 5. Secret Recovery & Security Continuity

1. **Compromised JWT Secret**:
   - Immediately update `JWT_SECRET` in environment variables (`.env`).
   - Restart backend instance (`docker-compose restart backend`).
   - All existing user sessions will be invalidated immediately, requiring re-authentication with BCrypt hashed credentials.
2. **Compromised Blockchain Private Key**:
   - Deploy new smart contract instance: `cd blockchain && npx hardhat run scripts/deploy.js`.
   - Update `BLOCKCHAIN_CONTRACT_ADDRESS` and `BLOCKCHAIN_PRIVATE_KEY` in backend `.env`.

---

## 6. QR Code Public Verification Continuity

The public QR code verification feature (`/verify/{packageId}`) is designed for zero-downtime availability:
- Serves verified batch records directly via cached database queries and off-chain SHA-256 hash checks.
- If the EVM RPC node is temporarily unreachable, verification gracefully displays `OFF_CHAIN_VERIFIED` status alongside the deterministic SHA-256 hash, keeping public consumer verification fully operational.

---

## 7. Clean-Room Environment Recreation

To rebuild the complete system from scratch on a new server:
1. **Clone repository**: `git clone https://github.com/nexora/honey-chain.git && cd honey-chain`
2. **Copy environment templates**: `cp .env.example .env`
3. **Spin up stack**: `docker-compose up --build -d`
4. **Restore database backup**: `.\scripts\restore-database.ps1 -BackupFile <path> -Force`
5. **Verify health**: `curl http://localhost:8080/api/health`
