# HoneyChain Phase 11 — Complete IoT Architecture & Real Sensor Integration Report

**Project**: HoneyChain — Blockchain-based Honey Traceability & Smart Beekeeping Management System  
**Problem Statement**: SIH26021  
**Team**: Nexora  
**Phase**: 11 (Complete IoT Architecture & Real Sensor Integration)  
**Date**: September 9, 2026  

---

## 1. Existing IoT Architecture Overview

The HoneyChain IoT architecture connects physical hive telemetry directly to the Spring Boot application server and React frontend dashboard:
$$\text{Physical Hive} \longrightarrow \text{DHT22 Sensor} \longrightarrow \text{ESP32 MCU} \xrightarrow[\text{X-IoT-API-Key}]{\text{Wi-Fi / HTTP POST}} \text{Spring Boot REST API} \longrightarrow \text{PostgreSQL DB} \longrightarrow \text{React Dashboard}$$

---

## 2. Physical Hardware Source of Truth

The confirmed physical hardware configuration consists of:
1. **ESP32-WROOM-32** Microcontroller Board
2. **DHT22** Digital Temperature & Relative Humidity Sensor
3. **SSD1306** OLED Display (128x64 pixels, I2C interface)

> [!IMPORTANT]
> The following optional hardware components are **NOT physically connected** and are explicitly marked as `null` in API payloads and `Not Installed` in UI dashboards:
> - **HX711 Load Cell** (Hive Weight deferred)
> - **INMP441 Microphone** (Acoustic Sound Level deferred)
> - **GPS Module** (Live GPS deferred; location provided via apiary metadata)

---

## 3. Sensor Wiring & Pinout Specifications

| Peripheral | Interface | ESP32 Pin | Details |
| :--- | :--- | :--- | :--- |
| **DHT22 Data** | Digital GPIO | `GPIO 4` | Pull-up resistor enabled (4.7kΩ) |
| **SSD1306 SDA** | I2C Data | `GPIO 21` | Address `0x3C` |
| **SSD1306 SCL** | I2C Clock | `GPIO 22` | Address `0x3C` |
| **VCC & GND** | Power | `3.3V / GND` | Shared rail |

---

## 4. Telemetry Payload Contract

The ESP32 transmits telemetry in JSON format to `POST /api/sensors`:

```json
{
  "hiveId": "hive-001",
  "temperature": 34.2,
  "humidity": 56.5,
  "weight": null,
  "soundLevel": null,
  "latitude": null,
  "longitude": null,
  "timestamp": 1700000000
}
```

---

## 5. Timestamp Convention & Normalization

- **ESP32 Firmware**: Synchronizes UTC time via NTP (`pool.ntp.org`). Transmits 10-digit Unix epoch seconds (`1700000000`).
- **Spring Boot Backend**: `CreateSensorReadingRequest.java` dynamically checks timestamp length. Values `<= 100,000,000,000` are parsed as seconds (`Instant.ofEpochSecond`), while `> 100,000,000,000` are parsed as milliseconds (`Instant.ofEpochMilli`).
- **Frontend Normalization**: `timeUtils.ts` (`parseTimestampMs`) normalizes any format into epoch milliseconds before calculating `Date.now() - ms`, displaying relative time (e.g. `15 seconds ago`) and local time of day (`10:25:48 PM`).

---

## 6. Wi-Fi & Network Behavior

- **Non-blocking Reconnection**: When Wi-Fi disconnects, the device issues background reconnection requests (`WiFi.reconnect()`) without blocking the main telemetry loop.
- **Visual Feedback**: OLED screen 2 displays Wi-Fi connection status (`CONNECTED`, `CONNECTING...`, `DISCONNECTED`).

---

## 7. HTTP/API Communication & Security

- **Endpoint**: `POST /api/sensors`
- **M2M Security Header**: `X-IoT-API-Key: HoneyChain-IoT-Device-Key-2026`
- **Backend Filter**: `JwtAuthenticationFilter` validates `X-IoT-API-Key` and grants `ROLE_BEEKEEPER` authority for machine-to-machine telemetry ingestion without user login credentials.
- **Status Responses**:
  - `201 Created`: Telemetry successfully recorded.
  - `400 Bad Request`: Out-of-bounds sensor values or malformed JSON.
  - `401 / 403`: Invalid or missing API key.

---

## 8. Sensor Error & Range Validation

- **DHT22 Failure Handling**: If `dht.readTemperature()` or `readHumidity()` returns `NaN` or out-of-range values (`< -40.0°C`, `> 80.0°C`, `< 0%`, `> 100%`), `dhtReadSuccess` is set to `false`. The payload transmits `temperature: null` and `humidity: null`.
- **Validation Distinction**:
  - **INVALID DATA** (`temp < -40°C` or `temp > 80°C`, `humidity > 100%`): Rejected at DTO layer with `400 Bad Request`.
  - **VALID BUT ABNORMAL DATA** (e.g., `temp = 42.0°C`): Accepted, saved, and processed by `AIAlertService` to trigger warning/critical screening alerts.

---

## 9. Device Status Model

| Status Badge | Criteria | UI Display |
| :--- | :--- | :--- |
| **ONLINE** | Telemetry received within last 60 seconds | Green glowing badge (`ESP32 TELEMETRY LIVE`) |
| **STALE** | Telemetry received between 60 seconds and 10 minutes ago | Yellow warning badge (`TELEMETRY STALE`) |
| **OFFLINE** | No telemetry for > 10 minutes or device unresponsive | Red alert badge (`TELEMETRY OFFLINE`) |
| **NOT INSTALLED** | Sensor hardware deferred | Muted badge (`Not Installed`) |

---

## 10. Offline Telemetry Buffering

To prevent telemetry loss during transient network interruptions:
- The ESP32 firmware implements a 5-record in-memory ring buffer (`offlineBuffer`).
- When Wi-Fi/API is offline, telemetry is cached locally.
- When network connectivity is restored, the ESP32 flushes stored records to the API before resuming real-time transmission.

---

## 11. OLED Screen Rotation Interface

The SSD1306 OLED rotates every 4 seconds between two display screens:

* **Screen 1 (Sensor Telemetry)**:
  ```text
  HONEYCHAIN SENSORS
  Hive: hive-001
  ---------------------
  Temp:     34.2 C
  Humidity: 56.5 %
  Weight:   Not Inst.
  Sound:    Not Inst.
  ```

* **Screen 2 (Network & Cloud Status)**:
  ```text
  HONEYCHAIN NETWORK
  ---------------------
  WiFi: CONNECTED
  IP: 192.168.1.105
  API Status: 201 OK
  Buffer: 0 queued
  ```

---

## 12. Verification & Automated Test Results

| Test Suite | Result | Details |
| :--- | :--- | :--- |
| **Backend Test Suite (`mvnw test`)** | **`BUILD SUCCESS`** | 72/72 tests passed |
| **Frontend Production Build (`npm run build`)** | **`SUCCESS (11.67s)`** | 2231 modules, 0 TS errors |
| **ESP32 Firmware (`main.cpp`)** | **`VALIDATED`** | Compiled & verified for ESP32 Arduino framework |

---

## 13. Summary of Hardware Capabilities & Limitations

- **Installed & Active**: ESP32, DHT22 (Temperature/Humidity), SSD1306 OLED (128x64).
- **Deferred Hardware**: HX711 Load Cell, INMP441 Microphone, GPS.
- **System Integrity**: All deferred hardware is explicitly reported as `Not Installed` without fabricated physical readings.
