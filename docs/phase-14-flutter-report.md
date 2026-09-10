# Phase 14 — HoneyChain Flutter Mobile Application Report

## Executive Summary

Phase 14 delivers a native Android Flutter mobile application for the **HoneyChain** platform (`/mobile`), fully integrated with the existing Spring Boot REST API backend (`http://10.0.2.2:8080` / custom LAN IP) and Hardhat EVM blockchain ledger.

The Flutter application provides mobile capabilities for authenticated **BEEKEEPER**, **INSPECTOR**, and **ADMIN** roles to monitor hives, review telemetry, execute AI screening, manage honey batches, log quality tests, track processing records, stamp QR codes, and view blockchain traceability, while also enabling **unauthenticated public QR scanning for customer provenance verification**.

---

## 1. Flutter Architecture

The mobile application is structured using a clean, maintainable architecture separating core utilities, models, network APIs, state management, and UI screens.

```
Flutter Mobile (Android)
  ├── core/ (config, network, storage, theme)
  ├── models/ (User, Hive, SensorReading, HoneyBatch, AIAlert, QualityTest, etc.)
  ├── services/ (REST API Client calls using http)
  ├── providers/ (AuthProvider, ThemeProvider using Provider package)
  ├── screens/ (Login, Dashboard, Hives, Batches, Quality, QR, Verification, etc.)
  └── main.dart (App root & route management)
```

- **Null Safety**: 100% sound null safety enabled (`sdk: ^3.12.2`).
- **State Management**: Standard Flutter `ChangeNotifier` and `Provider` pattern.
- **REST Client**: HTTP wrapper with timeout handling, JWT token header injection, 401 session expiry redirects, and network connectivity error handling.

---

## 2. Project Structure

```
mobile/
  lib/
    core/
      config/
        api_config.dart          # Configurable API base URL (Emulator vs LAN)
      network/
        api_client.dart          # HTTP client, auth header injection, error handling
      storage/
        auth_storage.dart        # Secure SharedPreferences storage for JWT token & user
      theme/
        app_theme.dart           # HoneyChain dark & light visual theme definitions
    models/
      user.dart                  # User & AuthResponse DTOs
      farm.dart                  # Farm model
      hive.dart                  # Hive model
      sensor_reading.dart        # Sensor reading with nullable optional physical sensors
      ai_alert.dart              # AI alert model
      ai_status.dart             # AI risk status model
      quality_evaluation.dart    # Quality evaluation request/response models
      telemetry_analysis.dart    # Telemetry analysis request/response models
      honey_batch.dart           # Honey batch workflow model
      quality_test.dart          # Quality testing model
      processing_record.dart     # Processing record model
      package_model.dart         # Package model
      traceability_event.dart    # Blockchain traceability event model
      blockchain_config.dart     # EVM configuration status model
      verification_result.dart   # Customer public verification payload
    services/
      auth_service.dart          # POST /api/auth/login, GET /api/auth/me
      hive_service.dart          # Hives & sensor telemetry APIs
      ai_service.dart            # AI risk, anomaly detection & quality evaluation APIs
      batch_service.dart         # Honey batch lifecycle APIs
      quality_service.dart       # Laboratory quality testing APIs
      processing_service.dart    # Processing record & packaging status APIs
      package_service.dart       # Package creation APIs
      verification_service.dart # Unauthenticated public verification API
      blockchain_service.dart   # Hardhat EVM ledger status & anchoring APIs
    providers/
      auth_provider.dart         # Global authentication state
      theme_provider.dart        # Dark / Light theme toggle state
    screens/
      login_screen.dart          # HoneyChain branding, login form, server URL dialog
      main_navigation_screen.dart# Role-aware bottom navigation bar
      dashboard_screen.dart      # Hive stats, active telemetry, alerts, quick actions
      hive_list_screen.dart      # Apiary hive directory
      hive_detail_screen.dart    # Detailed live telemetry & missing sensor cards
      sensor_history_screen.dart # Paginated telemetry history logs
      ai_screening_screen.dart   # AI-assisted screening with disclaimer compliance
      batch_list_screen.dart     # Honey batch workflow overview
      batch_detail_screen.dart   # Batch lifecycle stage viewer & action buttons
      quality_test_screen.dart   # Form to log quality tests (INSPECTOR/ADMIN)
      processing_screen.dart     # Form to log processing steps & ready for packaging
      package_screen.dart        # Package creation & QR code viewer
      qr_scanner_screen.dart     # Package QR scanner & manual input fallback
      public_verification_screen.dart # Public provenance screen (No auth required)
      blockchain_traceability_screen.dart # EVM transaction hash timeline viewer
      alerts_screen.dart         # AI anomaly alerts dashboard
      profile_screen.dart        # User profile, role display, dark mode, logout
    main.dart                    # Application entrypoint & MultiProvider setup
  test/
    auth_test.dart               # Auth & User JSON parsing unit tests
    hive_model_test.dart         # Hive JSON deserialization unit tests
    sensor_reading_test.dart     # Sensor reading & null sensor unit tests
    honey_batch_test.dart        # Honey batch status parsing unit tests
    ai_response_test.dart        # AI risk & quality evaluation unit tests
    widget_test.dart             # Flutter smoke test
```

---

## 3. API Integration

Flutter communicates with the Spring Boot backend REST endpoints without direct database access or key exposure.

| Feature Area | Endpoint | HTTP Method | Auth Required |
|---|---|---|---|
| Authentication | `/api/auth/login` | POST | No |
| Current User | `/api/auth/me` | GET | Yes |
| Hives | `/api/hives` | GET | Yes |
| Hive Details | `/api/hives/{id}` | GET | Yes |
| Latest Telemetry | `/api/hives/{id}/latest` | GET | Yes |
| Sensor History | `/api/hives/{id}/history` | GET | Yes |
| AI Anomaly Status | `/api/hives/{id}/ai-status` | GET | Yes |
| AI Telemetry Screening | `/api/ai/analyze-telemetry` | POST | Yes |
| AI Quality Screening | `/api/ai/evaluate-quality` | POST | Yes |
| AI Alerts List | `/api/ai/alerts` | GET | Yes |
| Honey Batches | `/api/batches` | GET | Yes |
| Create Batch | `/api/batches` | POST | Yes |
| Quality Testing | `/api/batches/{id}/quality-test` | GET / POST | Yes |
| Processing Records | `/api/batches/{id}/processing` | GET / POST | Yes |
| Package Creation | `/api/packages` | POST | Yes |
| Public Verification | `/api/verify/{packageId}` | GET | **No** |
| Blockchain Status | `/api/blockchain/status` | GET | Yes |
| Blockchain Traceability | `/api/blockchain/batch/{id}` | GET | Yes |

---

## 4. Authentication & Storage

- **Login API**: Uses `POST /api/auth/login` with username/password payload.
- **JWT Session**: Tokens are stored in platform local storage (`SharedPreferences`).
- **Authorization Header**: Automatically attached as `Authorization: Bearer <JWT>` for protected API calls.
- **Session Expiry (401)**: Intercepted by `ApiClient`. Clears stored JWT token and returns user to the Login screen.
- **User Restoration**: Calls `GET /api/auth/me` at application startup to restore session state.

---

## 5. Role Handling

The application reads the authenticated user's role (`ADMIN`, `BEEKEEPER`, `QUALITY_INSPECTOR`) and dynamically presents accessible screens and actions:

- **BEEKEEPER**: Hive monitoring, batch creation, processing management, alert viewing.
- **QUALITY_INSPECTOR**: Quality test entry, AI quality screening, batch verification.
- **ADMIN**: Access to all management screens, user information, and blockchain anchoring.
- **AUTHORIZATION ENFORCEMENT**: The backend Spring Boot REST API remains the authoritative security boundary. 403 responses display a permission message.

---

## 6. Hive & Telemetry Monitoring

- **Active Telemetry**: Displays live DHT22 temperature and humidity values.
- **Hardware Sensor Compliance**: In accordance with the confirmed physical hardware (ESP32 + DHT22 + SSD1306 OLED), missing or deferred sensors (HX711 weight, microphone acoustic sound, GPS) display **"Not Installed"** or **"Data Unavailable"** instead of fabricated values.

---

## 7. AI-Assisted Screening Compliance

Integrated AI endpoints (`/api/ai/analyze-telemetry`, `/api/ai/evaluate-quality`) provide risk scoring and anomaly detection.

- **Mandatory Disclaimer Banner**: Displayed on all AI screens:
  > *"AI-assisted screening result — laboratory validation recommended."*
- **Term Compliance**: Uses *"AI-Assisted Screening Result"* and does NOT use forbidden terms like *"AI Diagnosis"* or claim *"AI proves honey authenticity"*.

---

## 8. Batch Workflow, Quality, Processing & Packaging

Maintains the existing backend workflow state transitions without duplicating business logic:

1. **HARVESTED**: Created via `/api/batches`.
2. **QUALITY_TESTING / QUALITY_TESTED**: Lab results entered via `/api/batches/{id}/quality-test` (Moisture, pH, Color, Verdict).
3. **PROCESSING / PROCESSED**: Logged via `/api/batches/{id}/processing`. Processing temperature is explicitly attributed to the processing vessel sensor, not ambient DHT22.
4. **PACKAGED**: Created via `/api/packages` with QR URL stamping (`/verify/{packageId}`).

---

## 9. QR Code Scanning & Unauthenticated Customer Verification

- **QR Scanner**: Scans jar package QR code or accepts manual serial code entry (`PKG-xxx`).
- **Unauthenticated Endpoint**: `/api/verify/{packageId}` is publicly accessible without login.
- **Public Provenance Screen**: Displays complete batch lifecycle, harvest date, apiary location, laboratory quality metrics, AI screening report, processing history, and Hardhat EVM blockchain transaction hashes.

---

## 10. Blockchain Traceability Integration

- Communicates with existing backend blockchain APIs (`/api/blockchain/...`).
- Private keys and Web3 RPC credentials remain strictly secured on the backend.
- Displays transaction hash, data hash, event type, and chain ID (`31337`).
- Environment Labeling: Explicitly labeled **"Local Hardhat EVM"** when running in development mode.
- Fallback: If blockchain is offline, displays: *"Blockchain verification currently unavailable."* without faking transactions.

---

## 11. Network Configuration

- **Android Emulator**: Configured default `http://10.0.2.2:8080`.
- **Physical Android Phone**: Editable server URL dialog available on Login and Profile screens to support custom LAN IP addresses (e.g. `http://192.168.1.5:8080`).
- **Offline Error Handling**: Displays *"No connection to HoneyChain server."* when the API is unreachable.

---

## 12. Security Compliance

- No database passwords, JWT secrets, or Web3 private keys embedded in Flutter code.
- JWT tokens stored in platform local storage (`SharedPreferences`).
- Passwords are never stored locally.

---

## 13. Verification & Build Results

| Verification Test | Command | Result |
|---|---|---|
| Flutter Unit Tests | `flutter test` | **PASSED** (9/9 tests passed) |
| Backend Integration Tests | `.\mvnw.cmd clean test` | **PASSED** (72/72 tests passed, BUILD SUCCESS) |
| React Frontend Build | `npm run build` | **PASSED** (Built in 1m 32s) |
| Android Debug APK Build | `flutter build apk --debug` | **PASSED** (`app-debug.apk` compiled) |

---

## 14. Known Limitations & Future Improvements

1. **Push Notifications**: Deferred to a future phase as backend push infrastructure is currently not active.
2. **Camera Hardware Preview**: On Android emulators without virtual camera configuration, manual text payload input is provided alongside the scanner UI.
3. **Background Sync**: Mobile client operates in live online mode with cached state fallback; full offline background sync will be addressed in future phases.

---

## Conclusion

Phase 14 successfully delivers a clean, modern, student-level Flutter mobile client for Android that seamlessly integrates with the existing HoneyChain Spring Boot REST backend, PostgreSQL database, AI engine, and Hardhat EVM blockchain ledger without duplicating business logic or backend code.
