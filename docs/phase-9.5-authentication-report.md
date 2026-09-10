# HoneyChain Phase 9.5 — Authentication & Role-Based Access Control (RBAC) Report

**Project**: HoneyChain — Blockchain-based Honey Traceability & Smart Beekeeping Management System  
**Problem Statement**: SIH26021  
**Team**: Nexora  
**Phase**: 9.5 (Authentication and Role-Based Access Control)  
**Date**: September 9, 2026  

---

## 1. Executive Summary

Phase 9.5 verifies and completes the Authentication and Role-Based Access Control (RBAC) architecture of HoneyChain. Rather than creating duplicate authentication systems, the existing Spring Security stateless JWT authentication, BCrypt password hashing, and React Router protected navigation structure were inspected, verified, hardened, and tested end-to-end.

All protected backend REST APIs and frontend navigation routes are strictly guarded by JWT tokens and role authorizations (`BEEKEEPER`, `ADMIN`, `INSPECTOR`). Public routes (including public customer QR package verification `/verify/{packageId}` and public verification APIs `/api/verify/{packageId}`) remain unauthenticated as required.

---

## 2. Existing Authentication Components Discovered

Inspection of the existing HoneyChain codebase revealed a complete, pre-existing authentication framework:

1. **Backend Security Infrastructure**:
   - **`SecurityConfig.java`** ([`SecurityConfig.java`](file:///d:/honey-chain/backend/src/main/java/com/nexora/honeychain/config/SecurityConfig.java)): Configures Spring Security `SecurityFilterChain`, `AuthenticationManager`, `PasswordEncoder` (`BCryptPasswordEncoder`), CORS settings, and endpoint authorization rules.
   - **`JwtAuthenticationFilter.java`** ([`JwtAuthenticationFilter.java`](file:///d:/honey-chain/backend/src/main/java/com/nexora/honeychain/security/JwtAuthenticationFilter.java)): Intercepts incoming HTTP requests, extracts the `Authorization: Bearer <token>` header, validates the JWT, and populates the `SecurityContextHolder`.
   - **`JwtService.java`** ([`JwtService.java`](file:///d:/honey-chain/backend/src/main/java/com/nexora/honeychain/security/JwtService.java)): Handles JWT generation, parsing, expiration validation, and claim extractions (username, role).
   - **`CustomUserDetailsService.java`** ([`CustomUserDetailsService.java`](file:///d:/honey-chain/backend/src/main/java/com/nexora/honeychain/security/CustomUserDetailsService.java)): Loads user details from PostgreSQL `users` table for Spring Security authentication.
   - **`AuthController.java`** ([`AuthController.java`](file:///d:/honey-chain/backend/src/main/java/com/nexora/honeychain/controller/AuthController.java)): Exposes `/api/auth/login` and `/api/auth/me`.
   - **`User.java` & `Role.java`** ([`User.java`](file:///d:/honey-chain/backend/src/main/java/com/nexora/honeychain/entity/User.java)): JPA entities mapping system users and roles (`ADMIN`, `BEEKEEPER`, `INSPECTOR`).

2. **Frontend Authentication Infrastructure**:
   - **`AuthContext.tsx`** ([`AuthContext.tsx`](file:///d:/honey-chain/frontend/src/context/AuthContext.tsx)): Global React state managing `user`, `token`, `login`, `logout`, and token persistence in `localStorage`.
   - **`ProtectedRoute.tsx`** ([`ProtectedRoute.tsx`](file:///d:/honey-chain/frontend/src/components/ProtectedRoute.tsx)): Wraps protected application routes, redirecting unauthenticated users to `/login` with location memory.
   - **`apiClient.ts`** ([`apiClient.ts`](file:///d:/honey-chain/frontend/src/api/apiClient.ts)): Axios instance attaching `Bearer token` to requests and redirecting to `/login` on HTTP `401 Unauthorized`.
   - **`LoginPage.tsx`** ([`LoginPage.tsx`](file:///d:/honey-chain/frontend/src/pages/LoginPage.tsx)): Interactive login UI with email/username field, password field, show/hide password toggle, loading spinner, and error messaging.

---

## 3. Database Migration & Data Model

The database schema for user management is maintained via Flyway migrations:
- **Migration**: `V1__init_schema.sql` creates the `users` table:
  ```sql
  CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```

---

## 4. Development Login Credentials (Seeded Demo Accounts)

The database seeds development users automatically via `DataInitializer.java`:

| Role | Username | Password | Email | Description |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `Admin@12345` | `admin@honeychain.io` | Full system administration and all beekeeper features |
| **BEEKEEPER** | `beekeeper` | `Beekeeper@12345` | `beekeeper@honeychain.io` | Honey harvest, quality testing, processing, packaging |
| **INSPECTOR** | `inspector` | `Inspector@12345` | `inspector@honeychain.io` | Quality audit and verification access |

> [!NOTE]
> All passwords are stored in the database hashed using **BCrypt** (`$2a$10$...`). Plain-text passwords, password hashes, and JWT secrets are never exposed in API responses or git repositories.

---

## 5. Route Protection & Authorization Policy

### Public Routes (No Authentication Required)
- Frontend: `/login`, `/verify/*` (Consumer QR Verification)
- Backend: `POST /api/auth/login`, `GET /api/verify/**`, `GET /api/blockchain/status`, `GET /api/blockchain/event/**`, `GET /api/blockchain/batch/**`, `GET /api/health`

### Protected Routes (Requires JWT Authentication)
- Frontend: `/dashboard`, `/hives`, `/hives/*`, `/alerts`, `/batches`, `/processing`, `/packages`, `/traceability`, `/users`
- Backend:
  - `ANY /api/hives/**` -> `BEEKEEPER`, `ADMIN`
  - `ANY /api/batches/**` -> `BEEKEEPER`, `ADMIN`
  - `ANY /api/quality/**` -> `BEEKEEPER`, `ADMIN`, `INSPECTOR`
  - `ANY /api/processing/**` -> `BEEKEEPER`, `ADMIN`
  - `ANY /api/packaging/**` -> `BEEKEEPER`, `ADMIN`
  - `ANY /api/users/**` -> `ADMIN`

---

## 6. Files Changed During Phase 9.5

1. **`d:/honey-chain/frontend/src/pages/LoginPage.tsx`** ([`LoginPage.tsx`](file:///d:/honey-chain/frontend/src/pages/LoginPage.tsx)):
   - Enhanced redirect logic upon successful login to use `location.state.from.pathname` if present, ensuring users returning from a protected route redirect back to the exact page they requested.

2. **`d:/honey-chain/docs/phase-9.5-authentication-report.md`** ([`phase-9.5-authentication-report.md`](file:///d:/honey-chain/docs/phase-9.5-authentication-report.md)):
   - Comprehensive documentation of Phase 9.5 authentication implementation and test results.

---

## 7. Verification & Test Results

### 7.1 Backend Test Results (`.\mvnw.cmd clean test`)
- **Total Tests Run**: 72
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0
- **Status**: **`BUILD SUCCESS`**

Specifically tested authentication scenarios in `Phase3SecurityIntegrationTest`:
- `testSuccessfulLogin`: Returns 200 OK + valid JWT token
- `testInvalidPassword`: Returns 401 Unauthorized
- `testProtectedEndpointWithoutToken`: Returns 401 Unauthorized
- `testProtectedEndpointWithValidToken`: Returns 200 OK
- `testRoleRestriction_BeekeeperAccessingAdminEndpoint`: Returns 403 Forbidden
- `testPublicCustomerVerificationWithoutAuth`: Returns 200 OK without token

### 7.2 Frontend Build Result (`npm run build`)
- **Status**: **`SUCCESS`**
- **TypeScript Errors**: 0

### 7.3 End-to-End Browser Flow Verification
1. Opened `/hives/HIVE-HIM-001` unauthenticated -> redirected automatically to `/login`.
2. Submitted valid credentials (`beekeeper` / `Beekeeper@12345`) -> redirected to requested page (`/hives/HIVE-HIM-001`).
3. Confirmed Hive details, IoT telemetry, harvest forms, and action buttons work properly.
4. Clicked Logout -> authentication state cleared, redirected to `/login`.
5. Navigated to public QR consumer verification (`/verify/HC-PKG-2026-001`) while logged out -> displayed complete honey harvest, quality score, AI diagnosis, and local Hardhat EVM blockchain proof without requesting login.

---

## 8. Conclusion

Phase 9.5 is fully complete, hardened, and verified. Customer QR verification remains 100% public, while all administrative and beekeeping features are secured with JWT stateless authentication and role-based access control.
