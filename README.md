# HoneyChain 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  

HoneyChain is an enterprise-grade end-to-end smart beekeeping management, AI anomaly screening, and EVM blockchain honey traceability platform. It integrates physical IoT hive telemetry (ESP32 + DHT22 + SSD1306 OLED), an embedded Java ML decision support engine, off-chain cryptographic batch verification, EVM smart contract immutability, a Flutter mobile application for field beekeepers, and a public consumer transparency portal.

---

## 🏛️ Repository Architecture

HoneyChain is structured as a clean, modular monorepo:

```text
honeychain/
├── .github/workflows/ # GitHub Actions CI/CD Pipeline (5 Automated Quality Gates)
├── backend/           # Spring Boot REST API (Java 21, JPA, Flyway, PostgreSQL, Web3j, Embedded Java ML)
├── frontend/          # React + TypeScript + Vite Web Application (Served via Nginx SPA)
├── mobile/            # Flutter Android/iOS Mobile Application for Beekeepers & Inspectors
├── iot/               # ESP32 Firmware (DHT22 Temp & Humidity, SSD1306 OLED Display)
├── blockchain/        # Hardhat EVM Adapter Layer, Smart Contracts (HoneyTraceability.sol) & Deployment Scripts
├── ai/                # Embedded Java ML Engine Specs & Dataset Training Generators
├── scripts/           # Database Backup, Restore & One-Command System Verification Utilities
├── docs/              # System Architecture Specs, Security Audits & Technical Reports (Phases 1-19)
└── docker-compose.yml # Orchestrated Multi-Container Stack (Postgres, Hardhat Node, Backend, Frontend)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Docker & Docker Compose** (Recommended for 1-command startup)
- OR:
  - **Java 21 JDK** & **Maven 3.8+**
  - **Node.js 20+** & **npm**
  - **Flutter SDK 3.x** (for mobile app)
  - **PostgreSQL 16**

---

### 🐳 1. Docker Compose Full Stack Startup (Recommended)

1. **Clone repository & prepare environment variables**:
   ```bash
   cp .env.example .env
   ```
2. **Launch multi-container system**:
   ```bash
   docker-compose up --build -d
   ```
3. **Services exposed**:
   - **React Web Application**: `http://localhost:80`
   - **Spring Boot API Backend**: `http://localhost:8080/api`
   - **Health Check Endpoint**: `http://localhost:8080/api/health`
   - **Local Hardhat EVM RPC**: `http://localhost:8545`
   - **PostgreSQL Database**: `localhost:5432`

---

### 🛠️ 2. Developer One-Command System Verification

Run full regression checks across Hardhat EVM, Spring Boot Backend, React Frontend, and Flutter Mobile:

```powershell
# Windows PowerShell
.\scripts\verify-project.ps1
```
```bash
# Linux / macOS Bash
./scripts/verify-project.sh
```

---

### 🐘 3. Database Backup & Restoration

```powershell
# Create full PostgreSQL backup
.\scripts\backup-database.ps1

# Restore database backup (requires explicit confirmation)
.\scripts\restore-database.ps1 -BackupFile "backups\honeychain-backup-<timestamp>.sql"
```

---

## 🛡️ Security Architecture & Threat Mitigation

HoneyChain enforces multi-layered defense-in-depth across all system boundaries:

- **JWT HS256 Authentication**: Stateless authentication with 24-hour expiration, signature verification, and automated 401 challenge responses.
- **BCrypt Password Hashing**: Passwords stored as salted BCrypt hashes. Password fields are omitted in API responses via `@JsonIgnore`.
- **Role-Based Access Control (RBAC)**: Fine-grained method security (`@EnableMethodSecurity`) authorizing `ADMIN`, `BEEKEEPER`, and `QUALITY_INSPECTOR` roles authoritatively at the Spring Security filter layer.
- **M2M IoT API Key Isolation**: Physical ESP32 devices authenticate via `X-IoT-API-Key` headers scoped strictly to sensor ingestion endpoints (`/api/sensors`), preventing IoT credential compromise from escalating to Admin user endpoints.
- **Secure Mobile Credential Storage**: Mobile App tokens stored in `FlutterSecureStorage` (KeyStore/Keychain). Android `network_security_config.xml` restricts cleartext HTTP traffic strictly to local development hostnames (`10.0.2.2`, `localhost`).
- **EVM Private Key Isolation**: Smart contract deployer keys are externalized via environment variables (`BLOCKCHAIN_PRIVATE_KEY`) and never committed to source.
- **Public Verification Boundary**: Consumer QR verification endpoint (`/api/verify/{packageId}`) operates unauthenticated without exposing password hashes, JWT secrets, or internal stack traces.

---

## 🔍 Public QR Code Verification Guide

Consumers can verify honey package origin, lab quality reports, and EVM blockchain verification without logging in:
1. Open URL: `http://localhost/verify/PKG-2026-0001` (or via QR code scan).
2. View batch details, hive origin, harvest date, and lab quality score.
3. Inspect Cryptographic Event Hash (SHA-256) and matching EVM Blockchain Transaction Hash.

---

## 📋 Technology Stack Matrix

| Layer | Implemented Technology | Verification Command |
|---|---|---|
| **CI/CD Pipeline** | GitHub Actions (5 Quality Gates) | Automated on `push` / `pull_request` |
| **Backend Framework** | Spring Boot 3.3.3 (Java 21, JPA, Flyway) | `cd backend && .\mvnw.cmd clean test` |
| **Database & Backup** | PostgreSQL 16 Alpine + `pg_dump` Utilities | `.\scripts\backup-database.ps1` |
| **Frontend Framework** | React 18 (TypeScript, Vite, Custom Vanilla CSS, Nginx) | `cd frontend && npm run build` |
| **Mobile App** | Flutter 3.x (Dart, Provider, Secure Storage) | `cd mobile && flutter test` |
| **IoT Hardware** | ESP32-WROOM-32, DHT22 (Temp & Humidity), SSD1306 OLED | Physical device upload or simulated ingestion API |
| **AI / ML Layer** | Native Java ML Engine (`HoneyChainMlEngine`) | Integrated in Spring Boot test suite |
| **Blockchain Layer** | EVM Smart Contract (`HoneyTraceability.sol`), Web3j, Hardhat | `cd blockchain && npm test` |

---

## 📖 Comprehensive Documentation Index

- 📄 [Phase 1: Architecture & Data Model Baseline Report](file:///d:/honey-chain/docs/phase-1-report.md)
- 📄 [Phase 2: Core Domain Model & REST API Integration Report](file:///d:/honey-chain/docs/phase-2-report.md)
- 📄 [Phase 3: JWT Security & Role-Based Access Control Report](file:///d:/honey-chain/docs/phase-3-report.md)
- 📄 [Phase 4: React Dashboard & Web Application Report](file:///d:/honey-chain/docs/phase-4-report.md)
- 📄 [Phase 5: ESP32 IoT Sensor & OLED Integration Report](file:///d:/honey-chain/docs/phase-5-report.md)
- 📄 [Phase 6: AI Anomaly Screening & Quality Prediction Report](file:///d:/honey-chain/docs/phase-6-report.md)
- 📄 [Phase 7: Harvest, Processing & Packaging Workflow Report](file:///d:/honey-chain/docs/phase-7-report.md)
- 📄 [Phase 8: EVM Blockchain Traceability & Smart Contract Report](file:///d:/honey-chain/docs/phase-8-report.md)
- 📄 [Phase 9: Mobile Application Baseline Report](file:///d:/honey-chain/docs/phase-9-report.md)
- 📄 [Phase 10: Mobile IoT & Beekeeping Features Report](file:///d:/honey-chain/docs/phase-10-mobile-beekeeping-report.md)
- 📄 [Phase 11: Mobile Quality Inspection & QR Verification Report](file:///d:/honey-chain/docs/phase-11-mobile-quality-verification-report.md)
- 📄 [Phase 12: Mobile Blockchain Ledger & Security Audit Report](file:///d:/honey-chain/docs/phase-12-mobile-blockchain-security-report.md)
- 📄 [Phase 13: Mobile Off-Chain Sync & Polish Report](file:///d:/honey-chain/docs/phase-13-mobile-sync-polish-report.md)
- 📄 [Phase 14: System Audit, Anti-Fraud & Idempotency Report](file:///d:/honey-chain/docs/phase-14-system-audit-anti-fraud-report.md)
- 📄 [Phase 15: Public Customer Verification Portal Report](file:///d:/honey-chain/docs/phase-15-public-verification-portal-report.md)
- 📄 [Phase 16: Real-time Alerts & Notification Pipeline Report](file:///d:/honey-chain/docs/phase-16-realtime-alerts-report.md)
- 📄 [Phase 17: Production Deployment & System Hardening Report](file:///d:/honey-chain/docs/phase-17-deployment-security-report.md)
- 📄 [Phase 18: CI/CD, Backup & Disaster Recovery Report](file:///d:/honey-chain/docs/phase-18-cicd-release-report.md)
- 📄 [Phase 19: Security Audit & Attack-Resistance Report](file:///d:/honey-chain/docs/phase-19-security-audit-report.md)
- 📋 [HoneyChain Production Release Checklist](file:///d:/honey-chain/docs/release-checklist.md)
- 🛡️ [Disaster Recovery & Business Continuity Plan](file:///d:/honey-chain/docs/disaster-recovery.md)

---

## 🔒 Authentication & Demo Credentials

HoneyChain uses **Spring Security**, **JWT (HS256)**, and **BCrypt Password Hashing**.

> [!NOTE]
> Pre-seeded credentials for evaluation:

- **`ADMIN`**: Username `admin` | Password `Admin@12345`
- **`BEEKEEPER`**: Username `beekeeper` | Password `Beekeeper@12345`
- **`QUALITY_INSPECTOR`**: Username `inspector` | Password `Inspector@12345`

---

## 🧪 Verification & Automated Test Suite Summary

- **Hardhat Smart Contract Tests**: 3/3 Passed (`npx hardhat test`)
- **Spring Boot Integration Tests**: 88/88 Passed (`.\mvnw.cmd test`)
- **React Frontend Build**: Passed (`npm run build`)
- **Flutter Mobile App Tests**: 13/13 Passed (`flutter test`)
- **Flutter APK Build**: Release APK generated (`flutter build apk --release`)

---

## 📱 Android APK

HoneyChain Android application can be downloaded from the GitHub Releases page.

### Download & Installation Instructions

1. Open **Releases** on the GitHub repository (`https://github.com/bhanugbs2/sih-project/releases`).
2. Download the latest release APK (`HoneyChain-v1.0.0.apk`).
3. Install the APK on an Android device (enable "Install from Unknown Sources" if prompted).
4. Launch **HoneyChain** on your device. Make sure the phone and HoneyChain backend are reachable on the same local network when using a local LAN backend (e.g., `http://192.168.x.x:8080`).

