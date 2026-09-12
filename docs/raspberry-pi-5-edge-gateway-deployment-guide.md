# Raspberry Pi 5 Edge IoT Gateway Deployment Guide 🐝📡

This guide provides step-by-step physical installation, hardware wiring, network configuration, and systemd deployment instructions for the **Raspberry Pi 5 Edge IoT Gateway** in the HoneyChain industrial smart beekeeping ecosystem.

---

## 1. Hardware Requirements & Specs

| Item | Model / Specification | Purpose |
| :--- | :--- | :--- |
| **Edge IoT Gateway** | **Raspberry Pi 5 Model B (8GB RAM)** | Main Edge Processing Unit & Protocol Gateway |
| **Operating System** | Raspberry Pi OS (64-bit Debian 12 Bookworm) | Linux OS with systemd daemon support |
| **Industrial RS-485 Module** | USB-to-RS485 FTDI FT232RL or MAX485 | RS-485 serial interface to Modbus RTU sensor network |
| **Temperature Sensor** | Industrial PT100 / PT1000 RTD Stainless Probe | Precision hive core temperature monitoring (-50°C to +200°C) |
| **Humidity Sensor** | Industrial Capacitive Transmitter (4-20mA / RS485 Modbus) | Relative humidity monitoring (0 - 100% RH) |
| **Hive Weight Sensor** | Industrial Strain-Gauge Load Cell (150kg) + HX711/Modbus ADC | Continuous mass monitoring for honey storage & swarm detection |
| **Acoustic Sensor** | Industrial MEMS Microphone Array | Hive acoustic frequency spectrum monitoring (queen status detection) |
| **GNSS Module** | U-blox NEO-8M GNSS / GPS USB Module | Apiary geofencing and hive movement tracking |
| **Power Supply** | 5V 5A USB-C Power Supply with LiFePO4 UPS Backup | Continuous operational power with battery failover |

---

## 2. Hardware Wiring & RS-485 Modbus Network

```
+--------------------------------------------------------------------------+
|                       RASPBERRY PI 5 EDGE IOT GATEWAY                    |
|                                                                          |
|  [USB 3.0 Port] ────> USB-to-RS485 Converter                             |
|                           │                                              |
|                           ├─── A (+) ───> Industrial RS-485 Bus Line A   |
|                           └─── B (-) ───> Industrial RS-485 Bus Line B   |
+--------------------------------------------------------------------------+
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ Modbus Node 1 │           │ Modbus Node 2 │           │ Modbus Node 3 │
│  Temp (PT100) │           │ Humidity Sensor│           │ Load Cell ADC │
│ (Address 0x01)│           │ (Address 0x02)│           │ (Address 0x03)│
└───────────────┘           └───────────────┘           └───────────────┘
```

- **Bus Termination**: Install 120Ω termination resistors between RS-485 A and B lines at both extreme physical ends of the Modbus bus.
- **Baud Rate**: 9600 bps, 8 Data Bits, 1 Stop Bit, No Parity (Default Modbus RTU).

---

## 3. Gateway Software Installation on Raspberry Pi OS

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Python 3, pip, git, and SQLite3
sudo apt install -y python3 python3-pip python3-venv sqlite3

# 3. Create Gateway deployment directory
sudo mkdir -p /opt/honeychain/gateway
sudo chown -R pi:pi /opt/honeychain/gateway

# 4. Copy Edge Gateway software files
cp iot/edge_gateway/edge_gateway.py /opt/honeychain/gateway/
cp iot/edge_gateway/config.json.example /opt/honeychain/gateway/config.json
```

---

## 4. Configuration (`/opt/honeychain/gateway/config.json`)

```json
{
  "gatewayId": "GW-PI5-HIM-001",
  "name": "Raspberry Pi 5 Edge IoT Gateway - Apiary Alpha",
  "farmId": "FARM-HIM-001",
  "apiaryId": "APIARY-HIM-A",
  "hiveId": "HIVE-HIM-001",
  "hardwareVersion": "Raspberry Pi 5 Model B (8GB)",
  "firmwareVersion": "v2.4.0-industrial",
  "backendApiUrl": "http://192.168.0.144:8080/api/sensors",
  "mqttBrokerHost": "192.168.0.144",
  "mqttBrokerPort": 1883,
  "mqttTopicPrefix": "honeychain",
  "pollIntervalSeconds": 10,
  "storeAndForwardEnabled": true,
  "simulatedSensors": false,
  "rs485SerialPort": "/dev/ttyUSB0",
  "rs485BaudRate": 9600
}
```

---

## 5. Systemd Auto-Start Service Setup

```bash
# 1. Copy systemd service file
sudo cp iot/edge_gateway/honeychain-gateway.service /etc/systemd/system/

# 2. Reload systemd control daemon
sudo systemctl daemon-reload

# 3. Enable service to start automatically at boot
sudo systemctl enable honeychain-gateway.service

# 4. Start service immediately
sudo systemctl start honeychain-gateway.service

# 5. Check real-time service status
sudo systemctl status honeychain-gateway.service

# 6. View live application logs
journalctl -u honeychain-gateway.service -f
```

---

## 6. Store-and-Forward Offline Buffering Verification

The Raspberry Pi 5 Gateway contains an automatic **Store-and-Forward** engine using local SQLite storage (`/opt/honeychain/gateway/gateway_buffer.db`):

1. **Network Disconnection Test**: Disconnect Ethernet/Wi-Fi on the Raspberry Pi 5.
2. **Buffering Verification**: Observe gateway log:
   `💾 Telemetry buffered locally in SQLite due to network loss. Hive: HIVE-HIM-001`
3. **Network Restoration**: Reconnect Ethernet/Wi-Fi.
4. **Buffer Flush Verification**: Observe log:
   `🔄 Network active. Flushing 12 queued telemetry records from SQLite buffer...`
   `✅ Telemetry transmitted successfully. Status: 201`

Zero telemetry data points are lost during cellular or Wi-Fi network disruptions.

---

## 7. Operational Distinctions

- **Physical ESP32 Prototype Node**: ESP32-WROOM-32 micro-controller board transmitting via Wi-Fi (`POST /api/sensors`) with DHT22 temperature/humidity sensor and SSD1306 OLED screen.
- **Target Production Raspberry Pi 5 Edge IoT Gateway**: Heavy-duty industrial gateway handling RS-485 Modbus RTU sensor arrays, local edge pre-screening, SQLite store-and-forward resilience, and MQTT over TLS.
