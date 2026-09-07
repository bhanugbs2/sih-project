# HoneyChain 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  

HoneyChain is an end-to-end smart beekeeping management and tamper-proof honey traceability platform. It integrates IoT hive telemetry, AI-driven honey purity & quality analytics, immutable blockchain batch verification, and a modern consumer transparency portal.

---

## 🏛️ Repository Architecture

HoneyChain is structured as a modular monorepo:

```text
honeychain/
├── backend/       # Spring Boot REST API (Java 21, Spring Data JPA, Flyway, PostgreSQL)
├── frontend/      # React + TypeScript + Vite Web Application (9 Core Portals)
├── iot/           # ESP32 Firmware, Telemetry Payload Specs & Sensor Pinouts
├── blockchain/    # Blockchain Adapter Layer & Solidity Smart Contracts
├── ai/            # Java ML Architecture Specs (ONNX Runtime / DJL Quality & Anomaly Models)
└── docs/          # Comprehensive System Architecture, Mermaid Diagrams & Development Plan
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

## 📋 Technology Stack Summary

| Layer | Technology |
|---|---|
| **Backend Framework** | Spring Boot 3.3.x (Java 21) |
| **Database** | PostgreSQL + Flyway Migrations |
| **Frontend Framework** | React 18+ (TypeScript, Vite) |
| **Styling** | Custom Vanilla CSS (Glassmorphism, Dark Mode) |
| **IoT Hardware** | ESP32-WROOM-32, DHT22, HX711, INMP441, SIM7000G |
| **Blockchain** | Ethereum / EVM Compatible Smart Contracts + Web3 Adapter |
| **AI / ML** | Deep Java Library (DJL) / ONNX Runtime Java API |

---

## 📖 Documentation

- [System Architecture & Mermaid Diagrams](file:///d:/honey-chain/docs/architecture.md)
- [Development Plan & Roadmap](file:///d:/honey-chain/docs/development-plan.md)
- [Phase 1 Completion Report](file:///d:/honey-chain/docs/phase-1-report.md)
