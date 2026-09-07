# HoneyChain IoT Telemetry Component 🐝📡

The `/iot` module manages hardware specifications, firmware source code for ESP32 nodes, and simulated sensor providers for physical hardware unavailable during early testing.

---

## 1. Hardware Inventory & Status Matrix

| Component | Type | Status | Description |
|---|---|---|---|
| **ESP32-WROOM-32** | Microcontroller | **Physical Available** | Main processing unit with Wi-Fi / Bluetooth capabilities |
| **DHT22 / AM2302** | Sensor | **Physical Available** | High precision temperature & humidity sensor |
| **SSD1306 OLED** | Display | **Physical Available** | 0.96" I2C 128x64 display for local hive diagnostic output |
| **HX711 + Load Cell** | Sensor | **Simulated Provider** | Hive weight monitoring (measures honey accumulation & swarming) |
| **INMP441 Microphone** | Sensor | **Simulated Provider** | Acoustic frequency analysis (detects queen loss & swarming buzz) |
| **SIM7000G / GPS** | Module | **Simulated Provider** | Geofencing location tracking & cellular fallback |

---

## 2. Simulated Sensor Provider Strategy

For hardware marked **Simulated Provider**, the system provides standalone simulated data providers (`SimulatedWeightSensor`, `SimulatedAcousticSensor`, `SimulatedGpsSensor`). These classes produce realistic environmental readings so that backend, AI models, and frontend dashboards can be completely exercised without physical hardware dependencies.

---

## 3. Communication Protocol & Data Payload

Telemetry payload sent from ESP32 to Spring Boot Backend (`POST /api/v1/telemetry`):

```json
{
  "hiveCode": "HIVE-HIM-001",
  "temperature": 34.2,
  "humidity": 58.0,
  "weightKg": 42.5,
  "acousticHz": 240.0,
  "latitude": 31.1048,
  "longitude": 77.1734,
  "batteryLevel": 98.0,
  "timestamp": "2026-09-07T13:40:00Z"
}
```
