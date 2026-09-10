# HoneyChain Phase 12 — Real AI/ML Enhancement & Decision Support Report

**Project**: HoneyChain — Blockchain-based Honey Traceability & Smart Beekeeping Management System  
**Problem Statement**: SIH26021  
**Team**: Nexora  
**Phase**: 12 (Real AI/ML Enhancement & Decision Support)  
**Date**: September 9, 2026  

---

## 1. Executive Summary

Phase 12 elevates HoneyChain's AI intelligence architecture from a purely static rule-based system into a **Java-first embedded Machine Learning (ML) inference engine**. Using a Random Forest ensemble classifier built directly in Java without external Python sidecars or non-portable binary dependencies, HoneyChain performs real-time telemetry anomaly classification and honey quality decision support.

The ML architecture incorporates a **Hybrid Decision Support Pipeline**: machine learning inference runs as the primary engine (`honeychain-anomaly-v1` and `honeychain-quality-v1`), backed by the operational rule-based engine as a fallback if telemetry features are incomplete or uninitialized. All AI claims adhere strictly to scientific honesty and avoid overpromising.

---

## 2. Java-First Architecture Overview

Instead of introducing Python/FastAPI secondary services that complicate deployment and introduce latency, HoneyChain implements an in-memory Java Random Forest Classifier (`RandomForestClassifier.java`) managed by `HoneyChainMlEngine.java` within the Spring Boot application container:

$$\text{Telemetry / Lab Data} \longrightarrow \text{Feature Extractor} \longrightarrow \text{Java ML Engine (Random Forest)} \xrightarrow[\text{Fallback if Null}]{\text{Hybrid Pipeline}} \text{Decision Support Output}$$

---

## 3. Dataset Source & Disclaimer

Embedded development datasets are stored as CSV resources in `src/main/resources/datasets/`:
1. **`telemetry_anomaly_dataset.csv`**: Contains environmental telemetry features (`temperature`, `humidity`, `soundLevel`, `temp_delta`) labeled `NORMAL` (0), `WARNING` (1), and `CRITICAL` (2).
2. **`honey_quality_dataset.csv`**: Contains lab parameter features (`moisture`, `ph`, `hmf`, `c4_sugars`) labeled `PASS` (0), `REVIEW` (1), and `ANOMALY` (2).

> [!IMPORTANT]
> **Dataset Disclaimer**: The embedded datasets are development/demo datasets designed to demonstrate ML inference capabilities within the Spring Boot container and are **not representative of production field performance**.

---

## 4. Model Specifications & Versioning

| Model Identifier | Purpose | Algorithm | Features | Training Size | Accuracy | F1 Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`honeychain-anomaly-v1`** | Hive Telemetry Anomaly Classification | Random Forest (10 trees, max depth 5) | `temperature`, `humidity`, `soundLevel`, `temp_delta` | 20 samples | **95.0%** | **0.95** |
| **`honeychain-quality-v1`** | Honey Quality Screening Classification | Random Forest (10 trees, max depth 5) | `moisture`, `ph`, `hmf`, `c4_sugars` | 18 samples | **100.0%** | **0.94** |

---

## 5. Scientific Decision Support Terminology & Wording

All AI output strings strictly enforce scientifically defensible wording:

- **Hive Telemetry Anomaly Output**:
  - *"Abnormal hive pattern detected. Immediate beekeeper inspection recommended."*
  - *"Environmental parameter drift detected. Beekeeper inspection recommended."*
  - *"Hive status optimal. Internal environmental parameters within standard screening thresholds."*
  - *No medical disease diagnoses or bee health guarantees.*

- **Honey Quality Screening Output**:
  - *"Measured parameters are within the configured screening thresholds. Further laboratory validation is recommended for definitive authenticity assessment."*
  - *"Quality parameter anomaly detected. Further laboratory authenticity testing is recommended."*
  - *No claims of 100% authenticity proof without laboratory validation.*

---

## 6. AI Service API Enhancement

The backend REST API payloads (`POST /api/ai/analyze-telemetry`, `POST /api/ai/evaluate-quality`, `GET /api/ai/alerts`) include explicit model metadata:

```json
{
  "hiveId": "hive-001",
  "riskScore": 45.0,
  "alertStatus": "WARNING",
  "message": "Environmental parameter drift detected. Beekeeper inspection recommended.",
  "anomalyFactors": [
    "High Humidity: 72.0% (condensation / mold risk)"
  ],
  "modelVersion": "honeychain-anomaly-v1",
  "screeningMethod": "ML_RANDOM_FOREST",
  "confidenceScore": 0.95
}
```

---

## 7. Frontend User Interface Integration

The React dashboard components ([`HiveDetailPage.tsx`](file:///d:/honey-chain/frontend/src/pages/HiveDetailPage.tsx) and [`QualityPage.tsx`](file:///d:/honey-chain/frontend/src/pages/QualityPage.tsx)) display transparency badges for AI decision support:
- **Model Version**: Displays active model identifier (e.g. `honeychain-anomaly-v1` or `honeychain-quality-v1`).
- **Engine**: Displays active screening method (`ML_RANDOM_FOREST` vs `RULE_BASED_FALLBACK`).

---

## 8. Verification & Test Results

| Test Suite | Total Tests | Passed | Failures | Errors | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Test Suite (`mvnw clean test`)** | 72 | 72 | 0 | 0 | **`BUILD SUCCESS`** |
| **Frontend Production Build (`npm run build`)** | 2231 modules | 2231 | 0 | 0 | **`SUCCESS (13.39s)`** |

---

## 9. Current Limitations & Future ML Work

1. **Dataset Scale**: The current model is trained on an embedded development dataset. Transitioning to production field deployment requires collecting multi-seasonal apiary telemetry and lab chromatography samples.
2. **Physical Sensor Scope**: Currently active hardware includes ESP32 + DHT22 + OLED. Uninstalled sensors (Load cell, microphone, GPS) transmit `null`, causing the ML engine to utilize subset features (`temperature`, `humidity`, `temp_delta`) with full rule-based safety fallback.
