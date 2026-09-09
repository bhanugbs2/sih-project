# HoneyChain AI & Quality Intelligence Layer 🤖🍯

The `/ai` module manages the intelligent anomaly decision support system, screening feature extraction parameters, rule-based screening engine, and model specification interface for the HoneyChain platform.

---

## 1. Feature Vectors & Parameters

### A. Honey Quality & Screening Parameters
- **Moisture (%)**: International Honey Commission (IHC) standard max 20.0%. Optimal range: 15.0% - 17.5%. High moisture (>20%) indicates unripeness or water dilution.
- **pH Level**: Normal honey pH: 3.4 - 4.5. Deviations indicate potential quality parameter anomalies.
- **Color Score**: Standard honey floral color spectrum classification.

### B. Hive Telemetry Anomaly Screening Vector
- **Internal Temperature (°C)**: Target baseline 34.0°C - 36.0°C.
  - Spikes (>38.0°C): Thermal stress / heatwave / disease overheating.
  - Drops (<31.0°C): Colony weakening / queen loss / winter cluster failure.
- **Relative Humidity (%)**: Target baseline 50% - 65%.
  - High (>70%): Moisture condensation / mold growth risk.
- **Acoustic Frequency (Hz)**: Baseline 220–250 Hz (Optional parameter — evaluated when hardware microphone is attached).
- **Weight Dynamics (kg/day)**: Daily honey accumulation vs sudden mass drop (Optional parameter).

---

## 2. Scientific Decision Support Guidelines

> [!IMPORTANT]
> The platform acts strictly as an **Intelligent Decision-Support / Screening Tool**. It does not make absolute claims of 100% natural origin or perform laboratory isotopic analysis.

**Mandatory Scientific Phrasing Standards**:
- *"Measured parameters are within the configured screening thresholds. Further laboratory validation is recommended for definitive authenticity assessment."*
- *"Quality parameter anomaly detected. Further laboratory authenticity testing is recommended."*
- *"Environmental parameter drift detected. Beekeeper inspection recommended."*

---

## 3. Implementation Status Architecture

### Currently Implemented
- **AI-Assisted Screening Engine**: Rule-based screening decision support evaluating moisture %, pH, and environmental telemetry thresholds.
- **Automated Anomaly Alerts**: Real-time IoT ingestion trigger generating system alerts upon parameter drift.

### Future ML Enhancement
- **Trained Neural Network / ML Models**: ONNX Runtime / Deep Java Library (DJL) integration for multi-variable time-series swarm forecasting.

### Laboratory Validation
- **Definitive Authenticity Testing**: Mass spectrometry (EA-IRMS for C3/C4 sugars), NMR profiling, and melissopalynological (pollen) analysis performed in certified laboratory facilities.

---

## 4. Directory Layout

```text
ai/
├── models/
│   ├── hive_anomaly_rules.json   # Anomaly risk scoring parameters & threshold rules
│   └── honey_purity_rules.json   # Honey purity score calculation & quality parameter rules
└── README.md                     # AI architecture specification
```
