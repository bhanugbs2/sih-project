# HoneyChain Project Plan 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  

---

## 1. Project Overview & Goal

HoneyChain is an end-to-end smart beekeeping management and tamper-proof honey traceability system. The primary objectives are:

1. **Smart Beekeeping Management**: Monitor hive health and environmental metrics using physical IoT nodes (ESP32, DHT22 temperature & humidity, SSD1306 OLED display).
2. **AI-Assisted Screening & Decision Support**: Provide automated anomaly detection and quality indicators to assist beekeepers (*e.g., "Abnormal hive pattern detected. Beekeeper inspection recommended."*).
3. **Traceability & Off-Chain Verification**: Ensure transparent, verifiable honey batches backed by off-chain cryptographic hash generation and auditing.
4. **Consumer Transparency**: Enable consumers to scan programmatic QR codes on honey jars to view full harvest-to-table lineage, lab quality screening scores, and verification proofs.

---

## 2. Technology Stack Matrix & Architecture Status

| Layer | Currently Implemented Technology | Future Extensions / Roadmap |
|---|---|---|
| **Backend** | Java 21 / Spring Boot 3.3.x (JPA, Validation, Actuator) | Microservice decomposition |
| **Database** | PostgreSQL + Flyway Migrations (`V1__init_schema.sql` through `V4__phase7_workflow.sql`) | Distributed database clustering |
| **Frontend** | React 18 / TypeScript / Vite (Vanilla CSS Glassmorphic design) | Offline PWA sync |
| **IoT Hardware** | **ESP32 Microcontroller, DHT22 (Temp/Humidity), SSD1306 OLED** | **HX711 Load Cell, Microphone, GPS Module** |
| **AI / ML Engine** | **Rule-Based AI-Assisted Screening & Decision Support** | **DJL / ONNX Neural Networks / Time-Series ML** |
| **Blockchain** | **Off-Chain Cryptographic Hashing & Traceability Logs** | **Phase 8 EVM Smart Contract Anchoring** |

---

## 3. Development Phase Roadmap

### Phase 0 — Project Foundation & Environment Verification
- Monorepo directory setup (`/backend`, `/frontend`, `/iot`, `/blockchain`, `/ai`, `/docs`).
- Environment tools validation (Java 21, Node.js v22, npm 10, Git).
- Architecture document & project plan with Mermaid diagrams.

### Phase 1 — Backend & Frontend Core Monorepo Setup
- Spring Boot REST controllers (`SystemStatusController`), Spring Data JPA, PostgreSQL Flyway migrations.
- React SPA shell with responsive sidebar, header, glassmorphic layout, and 9 routes (`/login`, `/dashboard`, `/hives`, `/batches`, `/quality`, `/processing`, `/packages`, `/blockchain`, `/verify`).

### Phase 2 — IoT Telemetry & Sensor Integration
- ESP32 firmware C++/Arduino sketch for installed physical sensors (DHT22 Temp & Humidity, SSD1306 OLED display).
- Nullable schema fields for deferred hardware (Load Cell weight, Microphone acoustics, GPS coordinates).

### Phase 3 — Authentication, Security & Role-Based Control
- Spring Security JWT filter, BCrypt password hashing, pre-seeded role permissions (`ADMIN`, `BEEKEEPER`, `QUALITY_INSPECTOR`).

### Phase 4 — React Dashboard & Interactive System Portals
- Real-time IoT monitoring workspace with live/stale status indicators, Recharts visual analytics, batch lifecycle management, quality testing, processing logs, and verification portals.

### Phase 5 — ESP32 Hardware Integration & M2M Telemetry Security
- Machine-to-machine `X-IoT-API-Key` authentication header, 5-second live telemetry ingestion from physical ESP32 node.

### Phase 6 — AI-Assisted Screening & Anomaly Decision Support
- Rule-based quality screening (`PURE`, `SUSPECTED_MOISTURE_DILUTION`, `QUALITY_PARAMETER_ANOMALY`) and swarm anomaly alerts.

### Phase 7 — Honey Harvest, Quality Testing & Processing Workflow (Completed)
- Complete off-chain production lifecycle: `HARVEST` → `HONEY BATCH` → `QUALITY TESTING` → `AI-ASSISTED SCREENING` → `PROCESSING` → `READY FOR PACKAGING`.
- Quality gates blocking failed/review batches from processing, manual quantity and temperature labeling, dual quality + AI cards on batch details, and 6-stage off-chain traceability timeline.

---

## 4. Major Architectural Principles

1. **Off-Chain vs On-Chain Segregation**:
   - Detailed sensor telemetry, user accounts, batches, quality tests, processing records, and packages remain stored off-chain in PostgreSQL.
   - Cryptographic hashes and verification proofs are generated off-chain, designated for Phase 8 on-chain blockchain anchoring.
2. **AI-Assisted Decision Support**:
   - AI predictions are framed as decision support for beekeepers (*"Abnormal hive pattern detected. Beekeeper inspection recommended."*) rather than absolute diagnostic or medical claims.
3. **Manual Harvest Quantity**:
   - Harvest weight/quantity is recorded as "Manual Harvest Quantity" entered by the beekeeper. The current ESP32 node does not measure honey weight.

---

## 5. Testing & Verification Strategy

- **Backend**: JUnit 5, Spring Boot Test, Maven build verification (`mvn clean compile`).
- **Frontend**: TypeScript type check (`tsc -b`), Vite production bundler check (`npm run build`).
- **Integration**: REST API response verification, Flyway schema validation, component rendering checks, and `Phase7WorkflowIntegrationTest.java`.
