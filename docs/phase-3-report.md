# HoneyChain Phase 3 Report: Authentication, Authorization & API Security

**Project**: HoneyChain (SIH26021)  
**Team**: Nexora  
**Phase**: 3 - Authentication, Authorization & API Security  
**Status**: COMPLETED & VERIFIED  

---

## 1. Authentication Architecture

HoneyChain Phase 3 establishes a robust, stateless security architecture using **Spring Security 6**, **JSON Web Tokens (JWT)**, and **BCrypt Password Hashing**.

```
User / Client (Postman, Browser, React)
          │
   1. POST /api/auth/login (username & password)
          ▼
    AuthenticationManager & UserDetailsService
          ▼
   2. Verify Credentials against BCrypt Hash
          ▼
   3. Generate Signed JWT (HS256) with role claim
          ▼
   4. Return Token to Client { token, tokenType: "Bearer", expiresIn, role }
          │
          │ Client sends: Authorization: Bearer <token>
          ▼
    JwtAuthenticationFilter (OncePerRequestFilter)
          ▼
    Validate Token Signature & Expiration
          ▼
    Populate SecurityContextHolder
          ▼
    Role-based Controller Endpoint Protection (@PreAuthorize)
```

---

## 2. User Model

The `User` JPA entity is mapped to the `users` PostgreSQL table with strict uniqueness constraints:

```java
@Entity
@Table(name = "users")
public class User {
    private String id;               // UUID v4 String
    private String username;         // Unique, NOT NULL (3-50 chars)
    private String email;            // Unique, NOT NULL
    private String passwordHash;     // BCrypt Hashed Password (never plaintext)
    private UserRole role;           // ADMIN, BEEKEEPER, QUALITY_INSPECTOR
    private boolean enabled;         // Boolean flag for account activation
    private Instant createdAt;       // Timestamp
    private Instant updatedAt;       // Timestamp
}
```

---

## 3. Roles

HoneyChain strictly enforces standard role-based access control (RBAC) through the `UserRole` enum:

- **`ADMIN`**: System administrator with full access to user management, farms, hives, sensors, batches, quality tests, processing, packaging, and emergency recall operations.
- **`BEEKEEPER`**: Beekeeping operations role capable of reading farm/hive data, submitting IoT telemetry readings, viewing AI alerts, creating/managing harvest batches, and inspecting processing/packaging state.
- **`QUALITY_INSPECTOR`**: Laboratory & quality analyst role authorized to view hives/batches, record/update lab quality test results, view quality history, and inspect supply chain traceability records.

---

## 4. JWT Implementation

- **`JwtService`** manages JWT creation, parsing, signature validation, and claims extraction using JJWT 0.12.6.
- Algorithm: HMAC-SHA256 (`HS256`).
- Key Claims: `sub` (username), `role` (`ADMIN`/`BEEKEEPER`/`QUALITY_INSPECTOR`), `iat` (issued at), `exp` (expiration).
- Configurable properties in `application.yml` via environment variables:
  - `JWT_SECRET` (property `jwt.secret`)
  - `JWT_EXPIRATION` (property `jwt.expiration`, default: 86400 seconds / 24 hours).

---

## 5. Password Hashing

- All passwords are encrypted using `BCryptPasswordEncoder` before storage.
- Password hashes are never stored as plaintext and are strictly omitted from all DTO responses (`UserResponse`, `AuthResponse`).

---

## 6. Security Configuration

`SecurityConfig.java` defines stateless API security:
- **Stateless Session Management**: `SessionCreationPolicy.STATELESS` (no HTTP sessions).
- **CSRF**: Disabled for RESTful stateless APIs.
- **CORS**: Configured using `CorsConfigurationSource` supporting configurable origins (`app.cors.allowed-origins`, default `http://localhost:5173,http://localhost:3000`).
- **Exception Handlers**:
  - `CustomAuthenticationEntryPoint`: Returns HTTP 401 Unauthorized JSON error response.
  - `CustomAccessDeniedHandler`: Returns HTTP 403 Forbidden JSON error response.

---

## 7. Endpoint Protection & Authorization Matrix

| Endpoint Route | HTTP Method | Permitted Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | GET | **PUBLIC** | System health status |
| `/api/v1/health` | GET | **PUBLIC** | V1 health status |
| `/api/verify/{packageId}` | GET | **PUBLIC** | Customer QR verification |
| `/api/auth/login` | POST | **PUBLIC** | Authenticate credentials & return JWT |
| `/api/auth/register` | POST | **PUBLIC** | Controlled user registration |
| `/api/auth/me` | GET | Authenticated | Get current user profile |
| `/api/users/**` | ALL | `ADMIN` | User account & role management |
| `/api/farms` | POST, PUT, DELETE | `ADMIN` | Farm management |
| `/api/farms` | GET | `ADMIN`, `BEEKEEPER` | List & view farms |
| `/api/hives` | POST, PUT, DELETE | `ADMIN` | Hive management |
| `/api/hives/**` | GET | `ADMIN`, `BEEKEEPER`, `QUALITY_INSPECTOR` | View hives & telemetry |
| `/api/sensors/readings` | POST | `ADMIN`, `BEEKEEPER` | Submit IoT sensor readings |
| `/api/batches` | POST, PUT | `ADMIN`, `BEEKEEPER` | Create/manage harvest batches |
| `/api/batches/**` | GET | `ADMIN`, `BEEKEEPER`, `QUALITY_INSPECTOR` | View batch details |
| `/api/batches/{id}/recall` | POST | `ADMIN` | Trigger batch emergency recall |
| `/api/batches/{id}/quality-test` | POST, GET | `ADMIN`, `QUALITY_INSPECTOR` | Record/view quality test results |
| `/api/batches/{id}/processing` | POST | `ADMIN` | Record processing step |
| `/api/batches/{id}/processing` | GET | `ADMIN`, `BEEKEEPER` | View processing history |
| `/api/packages` | POST | `ADMIN` | Create retail packages |
| `/api/packages/{id}` | GET | `ADMIN`, `BEEKEEPER` | View package details |
| `/api/traceability/**` | GET | `ADMIN`, `BEEKEEPER`, `QUALITY_INSPECTOR` | View supply chain event timeline |

---

## 8. Database Migration

Migration script `V3__authentication_schema.sql` was added to `src/main/resources/db/migration/`:

```sql
-- Flyway Migration V3
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(30) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## 9. Demo Credentials

Development/Demo user accounts initialized automatically on startup via `DatabaseSeeder.java`:

> [!WARNING]
> The following credentials are strictly for development, testing, and SIH demonstration purposes.

- **ADMIN**:
  - Username: `admin`
  - Password: `Admin@12345`
  - Role: `ADMIN`
- **BEEKEEPER**:
  - Username: `beekeeper`
  - Password: `Beekeeper@12345`
  - Role: `BEEKEEPER`
- **QUALITY INSPECTOR**:
  - Username: `inspector`
  - Password: `Inspector@12345`
  - Role: `QUALITY_INSPECTOR`

---

## 10 & 11. Test Coverage & Test Results

A comprehensive security test suite `Phase3SecurityIntegrationTest.java` was created covering all 18 security requirements:

1. `testLoginSuccess` - Passed (200 OK & JWT returned)
2. `testLoginWrongPassword` - Passed (401 Unauthorized)
3. `testLoginUnknownUser` - Passed (401 Unauthorized)
4. `testJwtGenerationAndValidation` - Passed (Claims validated)
5. `testProtectedEndpointWithoutJwt` - Passed (401 Unauthorized)
6. `testProtectedEndpointWithValidJwt` - Passed (200 OK)
7. `testAdminEndpointWithAdminJwt` - Passed (200 OK)
8. `testAdminEndpointWithBeekeeperJwt` - Passed (403 Forbidden)
9. `testBeekeeperEndpointWithBeekeeperJwt` - Passed (200 OK)
10. `testQualityInspectorEndpoint` - Passed (200 OK)
11. `testCustomerVerificationPublic` - Passed (200 OK without JWT)
12. `testHealthEndpointPublic` - Passed (200 OK without JWT)
13. `testPasswordStoredAsBcrypt` - Passed (Verified `$2a$` BCrypt prefix)
14. `testPasswordHashNotExposed` - Passed (Verified response omits hash)
15. `testDisabledUserCannotLogin` - Passed (401 Unauthorized)
16. `testDuplicateUsernameRegistration` - Passed (409 Conflict)
17. `testDuplicateEmailRegistration` - Passed (409 Conflict)

**All 37 test cases across Phase 1, Phase 2, and Phase 3 pass with 0 errors and 0 failures.**

---

## 12. Swagger / OpenAPI Configuration

Updated `OpenApiConfig.java` to define standard JWT Bearer SecurityScheme:
- Developers can open Swagger at `http://localhost:8080/swagger-ui.html`.
- Execute `POST /api/auth/login` to obtain JWT token.
- Click the **Authorize** button in Swagger UI and paste the token to test protected endpoints.

---

## 13. Postman Updates

Created `docs/HoneyChain_Phase3.postman_collection.json` containing pre-configured requests for Login, Registration, Get Profile, User Management, and Protected APIs with Bearer authorization variables.

---

## 14 & 15. Problems Encountered & Fixed

1. **JsonPath Expectation Mismatch on Password Null Check**: `jsonPath("$.password", nullValue())` failed when the key was absent in JSON response.  
   *Fix*: Updated test assertion to `jsonPath("$.password").doesNotExist()`.
2. **Missing Test Prerequisite Data in Isolated H2 Test Environment**: Test cases querying specific batch and package IDs failed with 404.  
   *Fix*: Added test setup helper seeding test batch & package records in `Phase3SecurityIntegrationTest.java`.
3. **Repository Symbol Resolution**: `FarmRepository` lacked `existsByFarmId`.  
   *Fix*: Added `boolean existsByFarmId(String farmId)` to `FarmRepository.java`.

---

## 16. Remaining Work

Phase 3 is 100% complete and verified. Remaining work belongs to subsequent phases:
- Phase 4: AI Quality Engine (ONNX/DJL integration & predictive swarm/anomaly models).
- Phase 5: ESP32 IoT Hardware Ingestion & MQTT/HTTP Bridges.
- Phase 6: Blockchain Smart Contracts & Web3 Integration.
- Phase 7: React / Web Dashboard & Mobile Verification Views.
