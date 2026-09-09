# HoneyChain — Phase 5 Completion Report
**ESP32 + DHT22 + OLED IoT Integration**

## Executive Summary
Phase 5 of the HoneyChain project has been successfully completed. The HoneyChain platform now features full IoT node integration connecting physical ESP32 microcontrollers, DHT22 temperature and humidity sensors, and 0.96" SSD1306 OLED displays with the Spring Boot backend (`POST /api/sensors`) and React live monitoring workspace.

---

## 1. Hardware Architecture & Status Matrix

| Component | Hardware Model | Installation Status | Description |
|---|---|---|---|
| **Microcontroller** | ESP32-WROOM-32 | **Physical Installed** | Main 240MHz dual-core node with Wi-Fi & NTP time sync |
| **Temp & Humidity** | DHT22 / AM2302 | **Physical Installed** | Precision digital temperature (-40 to 80°C) and humidity (0-100%) |
| **Local Display** | SSD1306 OLED (128x64 I2C) | **Physical Installed** | Real-time local hive telemetry & diagnostic display |
| **Hive Mass Mass** | HX711 + Load Cell | **Hardware Deferred** | Hardware not physically attached; payload transmits `null` |
| **Hive Acoustics** | INMP441 Microphone | **Hardware Deferred** | Hardware not physically attached; payload transmits `null` |
| **Location Tracker**| SIM7000G / GPS | **Hardware Deferred** | Hardware not physically attached; payload transmits `null` |

---

## 2. Hardware Wiring & Pinouts

- **DHT22 Data Pin**: ESP32 **GPIO 4** (with 10kΩ pull-up resistor to 3.3V)
- **SSD1306 OLED SDA**: ESP32 **GPIO 21**
- **SSD1306 OLED SCL**: ESP32 **GPIO 22**
- **SSD1306 OLED I2C Address**: `0x3C`

---

## 3. Firmware Architecture (`iot/`)

```text
iot/
├── src/
│   └── main.cpp           # ESP32 C++ firmware (WiFi, NTP, DHT22, OLED, HTTP client)
├── platformio.ini         # PlatformIO build configuration & library dependencies
├── .env.example           # Wi-Fi SSID, Password, and PC LAN API URL template
└── README.md              # Hardware pinout matrix, setup guide, and serial monitor specs
```

### Key Firmware Functions:
- `setupWiFi()`: Connects to Wi-Fi with retry loop and OLED status display.
- `setupNTP()`: Synchronizes UTC epoch timestamp via `pool.ntp.org`.
- `readSensors()`: Samples DHT22 temperature & humidity every 5 seconds. Handles read failures cleanly without sending `NaN` or crashing.
- `displaySensorData()`: Renders local diagnostic display on 128x64 OLED (Screen Header, Hive ID, Temp °C, Humidity %, Wi-Fi status, HTTP status).
- `createTelemetryPayload()`: Constructs valid JSON payload with `hiveId` (`hive-001`), `temperature`, `humidity`, explicit `null` values for deferred hardware, and epoch timestamp.
- `sendTelemetry()`: Performs HTTP POST to `/api/sensors` using `X-IoT-API-Key` machine-to-machine authentication header.
- `handleWiFiFailure()`: Automatic background reconnection routine.

---

## 4. Telemetry JSON Data Payload

```json
{
  "hiveId": "hive-001",
  "temperature": 27.4,
  "humidity": 61.2,
  "weight": null,
  "soundLevel": null,
  "latitude": null,
  "longitude": null,
  "timestamp": 1700000000
}
```

---

## 5. Security & Ingestion Architecture

- **Machine-to-Machine Authentication**: Protected via `X-IoT-API-Key` header (`HoneyChain-IoT-Device-Key-2026`) evaluated in `JwtAuthenticationFilter`. Grants `ROLE_BEEKEEPER` authority to authenticated IoT devices without exposing user JWT credentials in firmware.
- **Backend Validation**: `CreateSensorReadingRequest` validates temperature, humidity (0-100%), and permits nullable optional hardware fields.
- **Persistence**: Persisted cleanly into PostgreSQL/H2 database via `SensorReadingRepository`.

---

## 6. React Live Monitoring Integration

- **Automatic Polling**: 5-second interval polling active while viewing `/hives/:hiveId`.
- **Live Status Indicator**:
  - `ESP32 TELEMETRY LIVE`: Displayed with relative age counter (`Last update: 3s ago`) when timestamp < 60s.
  - `TELEMETRY STALE / OFFLINE`: Displayed when telemetry timestamp > 60s.
- **Hardware Sensor Status Breakdown**:
  - DHT22 (Temp & Humidity): `ONLINE`
  - SSD1306 OLED: `ONLINE`
  - Load Cell (HX711): `Not Installed (Hardware Deferred)`
  - Microphone (INMP441): `Not Installed (Hardware Deferred)`
- **Charts**: Recharts time-series graphs for Temperature (°C) and Humidity (%) updating in real time.

---

## 7. Verification Results

| Checklist Item | Status | Notes |
|---|---|---|
| **ESP32 Firmware Code** | **PASS** | `iot/src/main.cpp` modular firmware created |
| **PlatformIO Config** | **PASS** | `iot/platformio.ini` configured with libraries |
| **Environment Template** | **PASS** | `iot/.env.example` created |
| **Backend Integration Test** | **PASS** | `Phase5IoTIntegrationTest.java` (6/6 subtests passed) |
| **Backend Full Test Suite** | **PASS** | All 43 tests passed (`BUILD SUCCESS`) |
| **Frontend Production Build**| **PASS** | `npm run build` completed cleanly |
| **M2M Security Filter** | **PASS** | `X-IoT-API-Key` header authentication verified |
| **Frontend Live Polling** | **PASS** | 5s polling & Live/Stale status banner added to `HiveDetailPage.tsx` |
