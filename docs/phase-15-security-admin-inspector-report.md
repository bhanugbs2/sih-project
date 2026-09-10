# Phase 15 — Mobile Security Hardening + Admin & Inspector Management Report

## Executive Summary

Phase 15 hardens mobile credential security, aligns role-based access control across backend REST services and Flutter, implements ADMIN user management capabilities, completes the INSPECTOR quality auditing workflow, and verifies full platform regression safety.

---

## 1. Security Audit & Improvements

A comprehensive audit of the Flutter mobile client and backend security architecture was conducted:

| Security Vector | Previous State | Hardened Phase 15 State | Defensible Security Claim |
|---|---|---|---|
| JWT Storage | Unencrypted `SharedPreferences` | Platform encrypted `FlutterSecureStorage` (Android KeyStore) | *"JWT credentials are stored using platform-secure storage."* |
| Legacy Migration | Manual entry | Safe auto-migration from `SharedPreferences` to secure storage | *"Legacy tokens are automatically migrated and purged from unencrypted storage."* |
| Logout Hardening | Selective removal | Complete purge of secure JWT, user metadata, and session state | *"Logout completely invalidates local credential state and revokes API authorization headers."* |
| 401 Session Expiry | Potential infinite retries | Single-pass state invalidation and immediate Login redirect | *"Expired sessions trigger instant authentication clearance and login redirection."* |
| Authorization Boundary | UI element hiding | Spring Boot `@PreAuthorize("hasRole('ADMIN')")` REST enforcement | *"Authentication and role-based authorization are enforced by the backend."* |
| Credential Exposure | Standard logging risk | Zero hardcoded passwords, JWT secrets, or Web3 private keys in Flutter | *"Sensitive credentials are not embedded in the mobile application."* |

---

## 2. JWT Storage Hardening (`flutter_secure_storage`)

- **Secure Storage**: `AuthStorage` now utilizes `FlutterSecureStorage` using `AndroidOptions(encryptedSharedPreferences: true)`.
- **Automatic Migration**: `getToken()` checks encrypted storage first. If absent, it reads legacy `SharedPreferences` tokens once, writes them to `FlutterSecureStorage`, and purges the unencrypted entry.
- **Zero Secrets**: Passwords, JWT secret keys, database credentials, and Web3 private keys are never stored on mobile devices.

---

## 3. Complete Logout & 401 Expiry Handling

- **Logout Purging**: `AuthStorage.clearAuth()` purges all secure JWT tokens and cached user data.
- **401 Interception**: `ApiClient` detects `401 Unauthorized` responses, clears stored credentials asynchronously, and prevents infinite request loops.
- **Protected Screen Access**: After logout or token invalidation, guarded routes automatically navigate to `LoginScreen`.

---

## 4. Role Name Consistency & Mapping

- **Backend Alignment**: Backend Java enum `UserRole` specifies:
  - `ADMIN`
  - `BEEKEEPER`
  - `QUALITY_INSPECTOR`
- **Flutter Model Mapping**: Flutter's `User` model matches backend role string names directly while supporting display formatting:
  - `ADMIN` → Displayed as **"Administrator"**
  - `BEEKEEPER` → Displayed as **"Beekeeper"**
  - `QUALITY_INSPECTOR` / `INSPECTOR` → Displayed as **"Quality Inspector"**
- **Internal Checks**: `user.isAdmin`, `user.isBeekeeper`, and `user.isInspector` provide uniform permission evaluation.

---

## 5. Backend Authorization Enforcement

- The Spring Boot REST API remains the authoritative security boundary.
- **Role Permissions**:
  - `ADMIN`: Full user administration, farm/hive monitoring, batch audit, and blockchain status.
  - `BEEKEEPER`: Hive monitoring, harvest logging, processing steps, packaging.
  - `QUALITY_INSPECTOR`: Quality test entry, AI quality screening review, traceability audit.
- **403 Forbidden Response**: Unauthorized requests returning HTTP `403` trigger user-friendly messaging in Flutter:
  > *"You do not have permission to perform this action."*

---

## 6. Admin User Management

### Backend Endpoints
- `GET /api/users`: List all registered system users (Admin only).
- `GET /api/users/{id}`: Retrieve single user details by ID (Admin only).
- `PATCH /api/users/{id}/enabled`: Enable or disable user account (Admin only).
- `PATCH /api/users/{id}/status`: Set user status (Admin only).
- `PATCH /api/users/{id}/role`: Update user assigned role (`ADMIN`, `BEEKEEPER`, `QUALITY_INSPECTOR`) (Admin only).

### Mobile Admin Screen (`AdminUsersScreen`)
- Displays registered users with search filter (by username, email, or role).
- Provides status badges (**ACTIVE** / **DISABLED**) and role badges.
- **Account Control**: Toggle user status (Enable/Disable) with modal confirmation.
- **Role Assignment**: Reassign role via radio selection dialog with modal confirmation.
- Exposes no plaintext passwords or password hashes.

---

## 7. Inspector Mobile Workflow

- **Quality Audit Overview**: Dedicated inspection features allowing quality inspectors to inspect honey batches, review AI quality screening results, examine lab parameters, and inspect blockchain transaction hashes.
- **Laboratory Data Submission**: Form support for:
  - Moisture Content (%)
  - pH Level
  - HMF (Hydroxymethylfurfural mg/kg)
  - C4 Sugars (%)
  - Color Grade (AMBER / LIGHT / DARK)
  - Test Verdict (`PASS`, `FAIL`, `REQUIRES_REVIEW`, `PENDING`)
- **Restricted Scope**: Inspectors cannot perform Admin user management or manage hive hardware.

---

## 8. Beekeeper Mobile Workflow

- Complete honey lifecycle management: Hive Monitoring → Telemetry Analysis → Harvest Logging → Processing Operations → Packaging & QR Stamping.
- Restricted from Admin user management endpoints (`403 Forbidden`).

---

## 9. Public Customer QR Verification

- Unauthenticated verification route `/verify/{packageId}` accessible directly via QR scanner without login.
- Displays package provenance, harvest date, apiary location, lab quality metrics, AI-assisted screening disclaimer, processing history, and Hardhat EVM transaction hashes.

---

## 10. Android Network & Server Security

- **Cleartext Traffic Scope**: `android:usesCleartextTraffic="true"` is scoped specifically for local development HTTP communication (`http://10.0.2.2:8080` emulator or LAN developer PC IP).
- **Production Guidance**: Production deployments must enforce HTTPS TLS endpoints without bypassing certificate validation.

---

## 11. Verification & Test Execution Results

| Pipeline / Verification Step | Executed Command | Result |
|---|---|---|
| Flutter Unit & Security Suite | `flutter test` | **PASSED** (13/13 unit & security tests passed) |
| Android Debug APK Compilation | `flutter build apk --debug` | **PASSED** (`build\app\outputs\flutter-apk\app-debug.apk` built) |
| Backend Integration Test Suite | `.\mvnw.cmd clean test` | **PASSED** (72/72 Spring Boot integration tests passed, BUILD SUCCESS) |
| React Web Frontend Compilation | `npm run build` | **PASSED** (Vite production bundle built in 40.58s) |

---

## 12. Known Limitations & Future Improvements

1. **Push Notifications**: Deferred to subsequent infrastructure phases as backend push triggers are not configured.
2. **Biometric Authentication**: Local biometric authentication (Fingerprint / Face ID) can be layered over `FlutterSecureStorage` in future client updates.
3. **Network Pinning**: Production HTTPS certificate pinning will be implemented prior to store release.

---

## Conclusion

Phase 15 completes mobile security hardening, aligns role-based authorization across backend and client tiers, provides practical ADMIN user management and INSPECTOR quality workflows, and maintains full regression safety across all HoneyChain platform components.
