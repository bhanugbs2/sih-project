# HoneyChain Project Plan 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  

---

## 1. Project Overview & Goal

HoneyChain is an end-to-end smart beekeeping management and tamper-proof honey traceability system. The primary objectives are:

1. **Smart Beekeeping Management**: Monitor hive health and environmental metrics using IoT sensors deployed on hives.
2. **AI Decision Support**: Provide automated anomaly detection and quality indicators to assist beekeepers (*e.g., "Abnormal hive pattern detected. Beekeeper inspection recommended."*).
3. **Immutable Honey Traceability**: Ensure 100% adulteration-free, verifiable honey batches anchored on a blockchain layer.
4. **Consumer Transparency**: Enable consumers to scan QR codes on honey jars to view full harvest-to-table lineage, lab quality scores, and cryptographic blockchain proofs.

---

## 2. Technology Stack Matrix

| Layer | Primary Technology | Description / Details |
|---|---|---|
| **Backend** | Java 21 / Spring Boot 3.3.x | REST API, Spring Data JPA, Spring Validation, Actuator |
| **Database** | PostgreSQL | Off-chain telemetry, batch records, user management |
| **Migrations** | Flyway | Versioned database schema migrations (`V1__init_schema.sql`) |
| **Frontend** | React 18 / TypeScript / Vite | Responsive SPA, Vanilla CSS Glassmorphic design system |
| **AI / ML** | Tribuo (with Weka / Smile fallbacks) | Java-compatible ML engine for honey purity & anomaly detection |
| **IoT Node** | ESP32 Microcontroller | ESP32, DHT22 (Temp/Humidity), OLED SSD1306, simulated Load Cell/HX711, Mic, GPS |
| **Blockchain** | Local EVM / Abstraction Layer | Smart contracts (`HoneyTraceability.sol`), Merkle root batch anchoring |

---

## 3. Development Phase Roadmap

### Phase 0 — Project Foundation & Environment Verification (Current)
- Monorepo directory setup (`/backend`, `/frontend`, `/iot`, `/blockchain`, `/ai`, `/docs`).
- Environment tools validation (Java 26/21, Node.js v22, npm 10, Git).
- Architecture document & project plan with Mermaid diagrams.
- Base build configuration for backend & frontend.

### Phase 1 — Backend & Frontend Core Monorepo Setup
- Spring Boot REST controllers (`SystemStatusController`), Spring Data JPA, PostgreSQL Flyway migrations.
- React SPA shell with responsive sidebar, header, glassmorphic layout, and 9 routes (`/login`, `/dashboard`, `/hives`, `/batches`, `/quality`, `/processing`, `/packages`, `/blockchain`, `/verify`).

### Phase 2 — IoT Telemetry & Sensor Provider Layer
- ESP32 firmware C++/Arduino sketch for physical sensors (DHT22, OLED SSD1306).
- Simulated sensor providers for physical hardware currently unavailable (Load Cell + HX711 weight, Microphone acoustics, GPS coordinates).

### Phase 3 — AI/ML Decision Support Engine
- Integration of Tribuo / Weka Java ML library.
- Honey quality index calculation and anomaly alerts.
- Scientific wording enforcement (*"Abnormal hive pattern detected. Beekeeper inspection recommended."*).

### Phase 4 — Blockchain Traceability & QR Serialization
- Local blockchain abstraction layer & smart contract deployment (`HoneyTraceability.sol`).
- Off-chain vs On-chain data segregation (Telemetry off-chain in Postgres; Merkle roots on-chain).
- Programmatic QR code generation for jar packages.

### Phase 5 — Full System Integration & End-to-End Testing
- Full lifecycle integration: Hive IoT -> Sensor Data -> AI Alert -> Harvest Batch -> Quality Test -> Processing -> Package QR -> Blockchain Anchor -> Consumer Verification.
- Automated end-to-end integration tests & performance validation.

---

## 4. Major Features & Architecture Principles

1. **Off-Chain vs On-Chain Segregation**:
   - Detailed sensor readings remain stored off-chain in PostgreSQL to maintain low gas costs and scalable performance.
   - Only critical traceability events (harvest date, floral source, lab purity score, Merkle root hash) are committed on-chain.
2. **Decision Support AI**:
   - AI predictions are framed as decision support for beekeepers rather than definitive medical or diagnostic claims.

---

## 5. Testing & Verification Strategy

- **Backend**: JUnit 5, Spring Boot Test, Maven build verification (`mvn clean compile`).
- **Frontend**: TypeScript type check (`tsc --noEmit`), Vite production bundler check (`npm run build`).
- **Integration**: REST API response verification, Flyway schema validation, and component rendering checks.

---

## 6. Deployment Strategy

- **Backend**: Containerized Docker image running Spring Boot on Java 21 Runtime Environment.
- **Frontend**: Static SPA hosted on Vite / Nginx web server or cloud CDN.
- **Database**: Managed PostgreSQL instance with Flyway auto-migration on boot.
