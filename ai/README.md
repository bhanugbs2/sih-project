# HoneyChain AI & Quality Intelligence Layer 🤖🍯

The `/ai` module provides machine learning architecture for honey purity scoring and hive anomaly detection using Java-compatible ML frameworks.

---

## 1. Java ML Framework Strategy

To seamlessly run model inference inside the Spring Boot Java backend without external Python runtime dependencies:

- **Primary Choice**: **Tribuo** (Oracle's modern Java ML library)
- **Fallback Options**: **Weka** or **Smile** (Statistical Machine Intelligence and Learning Engine)

---

## 2. Models & Objectives

1. **Honey Purity & Quality Scoring Model**:
   - Inputs: Moisture %, pH level, HMF (Hydroxymethylfurfural) value, Diastase activity, pollen spectrum.
   - Output: Purity Score (0-100%) and C3/C4 sugar adulteration risk flag (`PURE` / `SUSPECTED` / `ADULTERATED`).

2. **Hive Telemetry Anomaly Detector**:
   - Inputs: Temperature fluctuations, humidity shifts, acoustic frequency bands, weight dynamics over 24h.
   - Output: Anomaly classification index.

---

## 3. Scientific Decision Support Wording Guidelines

> [!IMPORTANT]
> The AI system acts strictly as **Decision Support** for beekeepers and lab analysts. It does not issue absolute diagnostic claims.
>
> **Mandatory Phrasing Standard**:
> - *"Abnormal hive pattern detected. Beekeeper inspection recommended."*
> - *"Elevated moisture variance detected in batch sample. Secondary lab validation advised."*
