# HoneyChain IoT Telemetry & ESP32 Node 🐝📡

The `/iot` module contains firmware, hardware wiring specifications, and communication protocols for the physical ESP32 IoT node deployed in HoneyChain apiary hives.

---

## 1. Hardware Inventory & Status Matrix

| Component | Type | Status | Description |
|---|---|---|---|
| **ESP32-WROOM-32** | Microcontroller | **Physical Installed** | Main dual-core 240MHz node with Wi-Fi & Bluetooth |
| **DHT22 / AM2302** | Sensor | **Physical Installed** | Precision digital temperature (-40 to 80°C) & humidity (0-100%) sensor |
| **SSD1306 OLED** | Display | **Physical Installed** | 0.96" I2C 128x64 display for real-time local hive diagnostics |
| **HX711 + Load Cell** | Sensor | **Hardware Deferred** | Hive mass monitoring (measures honey storage & swarming weight drops) |
| **INMP441 Microphone** | Sensor | **Hardware Deferred** | Acoustic frequency monitoring (detects queen loss & pre-swarm buzzing) |
| **SIM7000G / GPS** | Module | **Hardware Deferred** | Geofencing location tracking & cellular fallback |

---

## 2. Hardware Wiring & Pinout Diagram

### DHT22 Temperature & Humidity Sensor
- **VCC** → ESP32 **3.3V** (or 5V depending on breakout board)
- **GND** → ESP32 **GND**
- **DATA** → ESP32 **GPIO 4** *(Requires 10kΩ pull-up resistor between VCC and DATA)*

### SSD1306 OLED Display (128x64 I2C)
- **VCC** → ESP32 **3.3V**
- **GND** → ESP32 **GND**
- **SDA** → ESP32 **GPIO 21**
- **SCL** → ESP32 **GPIO 22**
- **I2C Address**: `0x3C`

---

## 3. Directory Structure

```text
iot/
├── src/
│   └── main.cpp           # Main C++ firmware source (setupWiFi, readSensors, OLED, HTTP POST)
├── include/               # Header definitions
├── platformio.ini         # PlatformIO build configuration & library dependencies
├── .env.example           # Wi-Fi & LAN API URL configuration template
└── README.md              # Hardware documentation & setup guide
```

---

## 4. Telemetry JSON Protocol Specification

The ESP32 issues an HTTP POST request to `POST /api/sensors` every 10 seconds:

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

> [!NOTE]
> Hardware deferred sensors (`weight`, `soundLevel`, `latitude`, `longitude`) are transmitted as explicit `null` values. The backend persists these fields cleanly without triggering validation errors or generating fake simulated measurements.

---

## 5. OLED Display User Interface Screens

```text
+---------------------+
| HONEYCHAIN          |
| Hive: hive-001      |
| ------------------- |
| Temp:     27.4 C    |
| Humidity: 61.2 %    |
| ------------------- |
| WiFi: OK | API: 201 |
+---------------------+
```

### Display Fault States
- **DHT22 Error**: Displays `DHT22 ERROR! Check Sensor Wire`
- **Wi-Fi Disconnected**: Displays `WiFi: CONNECTING...`
- **Backend Error**: Displays `API: OFFLINE` (Code 500 / 404 / Connection Timeout)

---

## 6. Building & Flashing Firmware via PlatformIO

```bash
# Navigate to iot directory
cd iot

# Copy configuration template
cp .env.example .env

# Edit .env with your Wi-Fi credentials and PC LAN IP address
# e.g., HONEYCHAIN_API_URL=http://192.168.1.100:8080/api/sensors

# Build firmware
pio run

# Flash firmware to ESP32 via USB
pio run --target upload

# Open Serial Monitor (115200 baud)
pio device monitor
```
