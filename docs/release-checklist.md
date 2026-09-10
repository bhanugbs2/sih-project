# HoneyChain Production Release Checklist

**Project**: HoneyChain — Blockchain-based Honey Traceability & Smart Beekeeping Management System  
**Problem Statement**: SIH26021  
**Team**: Nexora  

This checklist must be executed and signed off prior to tagging any release or deploying updates to staging or production environments.

---

## 🔒 1. Security & Secret Isolation

- [ ] Zero hardcoded passwords, JWT secrets, or private keys exist in the codebase.
- [ ] `.env` files are excluded from Git via root [`.gitignore`](file:///d:/honey-chain/.gitignore).
- [ ] `.env.example` templates exist with safe placeholder values across all directories.
- [ ] All external API keys and secrets are supplied exclusively via environment variables.
- [ ] Non-root user permissions are enforced inside Docker container specs.

---

## 🟢 2. Backend Spring Boot Layer

- [ ] All unit and integration tests pass: `cd backend && ./mvnw clean test`.
- [ ] Production profile [`application-prod.yml`](file:///d:/honey-chain/backend/src/main/resources/application-prod.yml) is active (`SPRING_PROFILES_ACTIVE=prod`).
- [ ] Flyway database migrations execute cleanly on clean database boot.
- [ ] Database DDL strategy is set to `spring.jpa.hibernate.ddl-auto=validate` for production.
- [ ] System health check (`GET /api/health`) reports status `UP` without revealing database credentials or raw stack traces.

---

## 🔵 3. React Web Frontend Layer

- [ ] Dependencies installed via clean lockfile: `cd frontend && npm ci`.
- [ ] Production build succeeds without TypeScript compilation errors: `npm run build`.
- [ ] Nginx SPA routing fallback (`try_files $uri $uri/ /index.html;`) tested for direct page reloads.
- [ ] Asset Gzip compression and long-term caching headers configured in `nginx.conf`.
- [ ] Public QR verification portal operates without requiring user login (`/verify/{packageId}`).

---

## 📱 4. Flutter Mobile Application Layer

- [ ] Mobile dependencies resolved cleanly: `cd mobile && flutter pub get`.
- [ ] Flutter static analysis passes: `flutter analyze`.
- [ ] All unit and widget tests pass: `flutter test`.
- [ ] Debug/Release APK compilation succeeds: `flutter build apk --debug`.
- [ ] Role authorization matrix enforced for `ADMIN`, `BEEKEEPER`, and `QUALITY_INSPECTOR`.

---

## 🔗 5. EVM Smart Contract & Blockchain Layer

- [ ] Hardhat smart contract tests pass: `cd blockchain && npm test`.
- [ ] Smart contract `HoneyTraceability.sol` compiled cleanly (`artifacts/` generated).
- [ ] Local Hardhat EVM deployment verified (`scripts/deploy.js`).
- [ ] Off-chain fallback mechanism confirmed when EVM RPC is offline (`OFF_CHAIN_VERIFIED`).
- [ ] Public testnet deployment commands documented with explicit credential requirements.

---

## 🐘 6. Database & Backup Verification

- [ ] Schema baseline migrations validated via Flyway (`db/migration/`).
- [ ] Database backup executed cleanly using `scripts/backup-database.ps1` (or `.sh`).
- [ ] Backup restoration verified against a test database instance using `scripts/restore-database.ps1` (or `.sh`).
- [ ] Relational data references (users, hives, batches, quality tests, packages, traceability events) verified post-restore.

---

## 🐳 7. Docker Containerization

- [ ] Multi-stage Docker backend build succeeds: `docker build -t honeychain-backend backend/`.
- [ ] Multi-stage Docker frontend build succeeds: `docker build -t honeychain-frontend frontend/`.
- [ ] Multi-container stack orchestrates cleanly: `docker-compose up --build -d`.
- [ ] All containers pass internal health checks (`docker-compose ps`).

---

## 📋 Sign-off Matrix

| Role | Inspector Name | Signature | Date | Status |
|---|---|---|---|---|
| **Lead Architect** | Team Nexora Lead | `[APPROVED]` | 2026-09-10 | `READY_FOR_RELEASE` |
| **QA Lead** | Automated CI Suite | `[PASS]` | 2026-09-10 | `ALL_TESTS_PASS` |
