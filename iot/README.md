# HoneyChain Industrial IoT Gateway & Telemetry Architecture 🐝📡

The `/iot` module contains software, firmware, hardware specifications, and communication protocols for both the **Raspberry Pi 5 Edge IoT Gateway Target Production Architecture** and the **ESP32 Physical Prototype Node**.

---

## 0. Industrial Architecture Overview & Distinction

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    TARGET PRODUCTION INDUSTRIAL ARCHITECTURE                            │
├──────────────────────────┬───────────────────────────┬──────────────────────────────────┤
│  INDUSTRIAL SENSOR SUITE │ EDGE IOT GATEWAY          │ NETWORK & PROTOCOL INGESTION     │
│  Industrial RTD (PT100)  │ Raspberry Pi 5            │ RS-485 / Modbus RTU              │
│  Capacitive Humidity     │ Edge IoT Gateway          │ LoRaWAN / 4G-LTE / Wi-Fi         │
│  Strain-Gauge Load Cell  │ Store-and-Forward SQLite  │ MQTT over TLS & REST Ingestion   │
│  MEMS Acoustic & GNSS    │ Edge Anomaly Pre-Screening│ Spring Boot Backend              │
└──────────────────────────┴───────────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT PHYSICAL PROTOTYPE NODE                                      │
├──────────────────────────┬───────────────────────────┬──────────────────────────────────┤
│  MICROCONTROLLER         │ PHYSICAL SENSORS          │ LOCAL DIAGNOSTIC DISPLAY         │
│  ESP32-WROOM-32 (Dual)   │ DHT22 Temp & Humidity     │ SSD1306 OLED (128x64 I2C)        │
└──────────────────────────┴───────────────────────────┴──────────────────────────────────┘
```

> [!IMPORTANT]
> - **`[TARGET PRODUCTION ARCHITECTURE]`**: **Raspberry Pi 5 Edge IoT Gateway** interfacing with RS-485 / Modbus RTU industrial sensors, MQTT over TLS, and local SQLite store-and-forward buffering.
> - **`[CURRENT PHYSICAL PROTOTYPE]`**: **ESP32 Physical Node** equipped with DHT22 temperature/humidity sensor and SSD1306 OLED diagnostic screen issuing HTTP POST requests to `/api/sensors`.

---

## 1. Hardware Inventory & Status Matrix

| Component | Architecture Category | Status | Description |
|---|---|---|---|
| **Raspberry Pi 5 Model B** | Target Edge Gateway | **Production Target** | 8GB Edge Processing Unit with SQLite Store-and-Forward & MQTT |
| **Industrial RS-485 / Modbus** | Industrial Bus Interface | **Production Target** | Differential serial bus interfacing industrial sensor nodes |
| **Industrial PT100/RTD Probe** | Industrial Sensor | **Production Target** | Precision core hive temperature monitoring (-50 to 200°C) |
| **Industrial Load Cell Array** | Industrial Sensor | **Production Target** | 150kg strain-gauge load cell for continuous hive mass monitoring |
| **ESP32-WROOM-32** | Physical Prototype Node | **Physical Installed** | Main dual-core 240MHz node with Wi-Fi & Bluetooth |
| **DHT22 / AM2302** | Physical Prototype Sensor | **Physical Installed** | Digital temperature & humidity sensor on GPIO 4 |
| **SSD1306 OLED** | Physical Prototype Display | **Physical Installed** | 0.96" I2C 128x64 display for real-time local hive diagnostics |

---

## 2. Raspberry Pi 5 Edge Gateway Software (`/iot/edge_gateway/`)

Located in `iot/edge_gateway/`:
- `edge_gateway.py`: Python Edge IoT Gateway application supporting sensor polling, store-and-forward SQLite buffering, and MQTT transmission.
- `config.json.example`: Configuration template for gateway ID, farm ID, hive ID, and MQTT broker host.
- `honeychain-gateway.service`: Systemd service descriptor for Raspberry Pi OS auto-start.

---

## 3. Physical ESP32 Hardware Wiring & Pinout

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

## 5. Building & Flashing ESP32 Firmware via PlatformIO

```bash
# Navigate to iot directory
cd iot

# Copy configuration template
cp .env.example .env

# Edit .env with your Wi-Fi credentials and PC LAN IP address
# e.g., HONEYCHAIN_API_URL=http://192.168.0.144:8080/api/sensors

# Build firmware
pio run

# Flash firmware to ESP32 via USB
pio run --target upload

# Open Serial Monitor (115200 baud)
pio device monitor
```
