# HoneyChain 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  

HoneyChain is an end-to-end smart beekeeping management and honey traceability platform. It integrates physical IoT hive telemetry (ESP32 + DHT22 + OLED), AI-assisted screening & decision support, off-chain cryptographic batch verification, and a modern consumer transparency portal.

---

## 🏛️ Repository Architecture

HoneyChain is structured as a modular monorepo:

```text
honeychain/
├── backend/       # Spring Boot REST API (Java 21, Spring Data JPA, Flyway, PostgreSQL)
├── frontend/      # React + TypeScript + Vite Web Application (9 Core Portals)
├── iot/           # ESP32 Firmware (DHT22 Temp & Humidity, SSD1306 OLED Display)
├── blockchain/    # Blockchain Adapter Layer, Smart Contracts & Cryptographic Traceability Specs
├── ai/            # AI-Assisted Screening Engine Specs & Rule-Based Decision Models
└── docs/          # Comprehensive System Architecture, Mermaid Diagrams & Development Reports
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java**: Version 21 or higher
- **Node.js**: Version 20 or higher (v22 recommended)
- **PostgreSQL**: Version 15+ (Optional for Dev, default fallback configs provided)
- **Maven**: Version 3.8+ (or included wrapper)

---

### 🟢 1. Starting Backend Service

```bash
cd backend

# Create local environment config from template
cp .env.example .env

# Build and run application using Maven wrapper
./mvnw spring-boot:run
```

- **API Base URL**: `http://localhost:8080/api/v1`
- **Health Check Endpoint**: `http://localhost:8080/api/v1/status`
- **Actuator Health**: `http://localhost:8080/actuator/health`

---

### 🔵 2. Starting Frontend Application

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Routes Overview**:
  - `/login` - Authentication Portal
  - `/dashboard` - Smart Beekeeping System Overview
  - `/hives` - IoT Hive Telemetry & Environmental Monitoring
  - `/batches` - Honey Harvesting Batch Lifecycle
  - `/quality` - Lab Testing & Purity Analysis
  - `/processing` - Filtration, Processing & Extraction Logs
  - `/packages` - Packaging & QR Code Serialization
  - `/blockchain` - Blockchain Ledger & Immutability Audit
  - `/verify` - Public Honey Verification & Origin Portal

---

## 📋 Technology Stack & Architecture Status Matrix

| Layer | Currently Implemented Technology | Future Extensions / Roadmap |
|---|---|---|
| **Backend Framework** | Spring Boot 3.3.x (Java 21, JPA, Flyway) | Microservices & Kafka Event Stream |
| **Database** | PostgreSQL + Flyway Schema Migrations | Distributed Off-Chain Replicas |
| **Frontend Framework** | React 18+ (TypeScript, Vite, Custom Vanilla CSS) | PWA Offline Sync Support |
| **IoT Hardware** | **ESP32-WROOM-32, DHT22 (Temp & Humidity), SSD1306 OLED** | **HX711 Load Cell, Microphone, SIM7000G GPS** |
| **AI / ML Layer** | **Rule-Based AI-Assisted Screening & Decision Support** | **DJL / ONNX Neural Networks / Time-Series ML** |
| **Blockchain Layer** | **Off-Chain Cryptographic Hashing & Traceability Events** | **Future On-Chain EVM Smart Contract Anchoring** |

---

## 📖 Documentation

- [System Architecture & Lifecycle Specifications](file:///d:/honey-chain/docs/architecture.md)
- [Frontend Documentation](file:///d:/honey-chain/docs/frontend.md)
- [Phase 1 Completion Report](file:///d:/honey-chain/docs/phase-1-report.md)
- [Phase 2 Completion Report](file:///d:/honey-chain/docs/phase-2-report.md)
- [Phase 3 Security & Authentication Report](file:///d:/honey-chain/docs/phase-3-report.md)
- [Phase 4 React Dashboard & Frontend Report](file:///d:/honey-chain/docs/phase-4-report.md)
- [Phase 5 ESP32 + DHT22 + OLED IoT Integration Report](file:///d:/honey-chain/docs/phase-5-report.md)
- [Phase 6 AI-Assisted Screening Decision Engine Report](file:///d:/honey-chain/docs/phase-6-report.md)

---

## 🔒 Authentication, Authorization & Security

HoneyChain utilizes **Spring Security**, **JWT (JSON Web Tokens)**, and **BCrypt Password Hashing**.

### 🔑 Development & Demo Credentials

> [!WARNING]
> The following accounts are pre-seeded development/demo credentials for testing and SIH presentation:

- **`ADMIN`**: Username `admin` | Password `Admin@12345`
- **`BEEKEEPER`**: Username `beekeeper` | Password `Beekeeper@12345`
- **`QUALITY_INSPECTOR`**: Username `inspector` | Password `Inspector@12345`

### ⚙️ Environment Variables

Configure environment variables in your `.env` or application environment:
- `JWT_SECRET`: Secret key for JWT HS256 signing (minimum 256 bits).
- `JWT_EXPIRATION`: Token validity duration in seconds (default `86400` = 24 hours).
- `SPRING_PROFILES_ACTIVE`: Active profile (`dev`, `test`, `demo`).

### 📘 Swagger / OpenAPI Authorization

1. Open Swagger UI at `http://localhost:8080/swagger-ui.html`.
2. Authenticate via `POST /api/auth/login` using demo credentials.
3. Copy the returned `token`.
4. Click the **Authorize** button in Swagger UI, paste the token, and click **Authorize**.
5. Test protected endpoints with authenticated role privileges.

### 🧪 Running Security Test Suite

```powershell
cd backend
.\mvnw.cmd clean test
```
