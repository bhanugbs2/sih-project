/*
 * HoneyChain ESP32 IoT Node Firmware (Phase 11 — Complete IoT Architecture)
 * Target Hardware: ESP32-WROOM-32 + DHT22 Temperature/Humidity Sensor + SSD1306 OLED (128x64 I2C)
 * 
 * SIH Problem Statement: SIH26021
 * Team: Nexora
 * 
 * Physically Installed Sensors:
 * - ESP32 Microcontroller
 * - DHT22 Temperature & Humidity Sensor (Pin 4)
 * - SSD1306 OLED Display (128x64, I2C 0x3C, SDA 21, SCL 22)
 * 
 * Deferred / Uninstalled Hardware (Explicitly Sent as null):
 * - HX711 Load Cell (Weight = null)
 * - INMP441 Microphone (SoundLevel = null)
 * - GPS Module (Latitude/Longitude = null)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <time.h>

// Configuration Constants
#ifndef HIVE_ID
#define HIVE_ID "hive-001"
#endif

#ifndef IOT_API_KEY
#define IOT_API_KEY "HoneyChain-IoT-Device-Key-2026"
#endif

// Wi-Fi & API Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "http://192.168.1.100:8080/api/sensors"; // Spring Boot backend IP

// Hardware Pins
#define DHTPIN 4
#define DHTTYPE DHT22
#define OLED_SDA 21
#define OLED_SCL 22
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Sampling & Telemetry Intervals
const unsigned long SENSOR_READ_INTERVAL = 5000;     // Read DHT22 every 5s
const unsigned long TELEMETRY_SEND_INTERVAL = 10000;   // Post API telemetry every 10s
const unsigned long WIFI_RECONNECT_INTERVAL = 10000;  // Check Wi-Fi every 10s
const unsigned long OLED_ROTATE_INTERVAL = 4000;       // Rotate OLED screens every 4s

// Offline Telemetry Buffer
struct TelemetryRecord {
  float temperature;
  float humidity;
  bool isDhtValid;
  unsigned long timestamp;
};

#define MAX_BUFFER_SIZE 5
TelemetryRecord offlineBuffer[MAX_BUFFER_SIZE];
int bufferCount = 0;

// Peripherals
DHT dht(DHTPIN, DHTTYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// State Variables
float lastTemperature = 0.0;
float lastHumidity = 0.0;
bool dhtReadSuccess = false;
bool apiSuccess = false;
int lastHttpResponseCode = 0;
int oledScreenMode = 0; // 0 = Sensor Overview, 1 = Network & API Overview

unsigned long lastSensorReadTime = 0;
unsigned long lastTelemetrySendTime = 0;
unsigned long lastWiFiCheckTime = 0;
unsigned long lastOledRotateTime = 0;

// Function Prototypes
void setupWiFi();
void setupNTP();
bool readSensors();
void displayOled();
String createJsonPayload(float temp, float hum, bool isDhtValid, unsigned long epochTimestamp);
bool sendSingleTelemetry(String payload);
void sendTelemetry();
void bufferTelemetry(float temp, float hum, bool isDhtValid, unsigned long epochTimestamp);
void flushOfflineBuffer();
void handleWiFiFailure();
unsigned long getEpochTime();

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=========================================");
  Serial.println("  HONEYCHAIN ESP32 IOT FIRMWARE V2.0    ");
  Serial.println("=========================================");
  Serial.printf("Hive ID: %s\n", HIVE_ID);

  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("[ERROR] OLED Initialization Failed!"));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 10);
    display.println("HoneyChain Node");
    display.println("Initializing...");
    display.display();
  }

  dht.begin();
  Serial.println("[INFO] DHT22 Sensor initialized.");

  setupWiFi();

  if (WiFi.status() == WL_CONNECTED) {
    setupNTP();
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // 1. Periodically check Wi-Fi connection
  if (currentMillis - lastWiFiCheckTime >= WIFI_RECONNECT_INTERVAL) {
    lastWiFiCheckTime = currentMillis;
    if (WiFi.status() != WL_CONNECTED) {
      handleWiFiFailure();
    }
  }

  // 2. Read DHT22 every 5s
  if (currentMillis - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    lastSensorReadTime = currentMillis;
    dhtReadSuccess = readSensors();
  }

  // 3. Rotate OLED Display screen every 4s
  if (currentMillis - lastOledRotateTime >= OLED_ROTATE_INTERVAL) {
    lastOledRotateTime = currentMillis;
    oledScreenMode = (oledScreenMode + 1) % 2;
    displayOled();
  }

  // 4. Send Telemetry Payload every 10s
  if (currentMillis - lastTelemetrySendTime >= TELEMETRY_SEND_INTERVAL) {
    lastTelemetrySendTime = currentMillis;
    sendTelemetry();
  }
}

void setupWiFi() {
  Serial.printf("[INFO] Connecting to Wi-Fi SSID: %s\n", WIFI_SSID);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("HONEYCHAIN");
  display.println("---------------------");
  display.println("WiFi Status:");
  display.println("CONNECTING...");
  display.display();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[SUCCESS] Wi-Fi Connected!");
    Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WARN] Wi-Fi Connection Timeout. Retrying non-blockingly.");
  }
}

void setupNTP() {
  Serial.println("[INFO] Synchronizing NTP Time...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  time_t now = time(nullptr);
  int retry = 0;
  while (now < 8 * 3600 * 2 && retry < 8) {
    delay(500);
    now = time(nullptr);
    retry++;
  }

  if (now > 8 * 3600 * 2) {
    Serial.printf("[SUCCESS] NTP Time synchronized: %ld UTC\n", (long)now);
  } else {
    Serial.println("[WARN] NTP Sync Timeout. Using system millis fallback.");
  }
}

bool readSensors() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Validate DHT22 Readings
  if (isnan(temp) || isnan(hum) || temp < -40.0 || temp > 80.0 || hum < 0.0 || hum > 100.0) {
    Serial.println("[WARN] DHT22 Reading Error or Out-Of-Bounds!");
    return false;
  }

  lastTemperature = temp;
  lastHumidity = hum;
  Serial.printf("[SENSOR] Temp: %.1f C | Hum: %.1f %%\n", temp, hum);
  return true;
}

void displayOled() {
  display.clearDisplay();
  display.setCursor(0, 0);

  if (oledScreenMode == 0) {
    // Screen 1: Telemetry Overview
    display.println("HONEYCHAIN SENSORS");
    display.printf("Hive: %s\n", HIVE_ID);
    display.println("---------------------");
    if (!dhtReadSuccess) {
      display.println("DHT22: UNAVAILABLE");
      display.println("Check Sensor Wiring");
    } else {
      display.printf("Temp:     %.1f C\n", lastTemperature);
      display.printf("Humidity: %.1f %%\n", lastHumidity);
    }
    display.println("Weight:   Not Inst.");
    display.println("Sound:    Not Inst.");
  } else {
    // Screen 2: Network & Cloud Status
    display.println("HONEYCHAIN NETWORK");
    display.println("---------------------");
    if (WiFi.status() == WL_CONNECTED) {
      display.println("WiFi: CONNECTED");
      display.printf("IP: %s\n", WiFi.localIP().toString().c_str());
      display.printf("API Status: %s\n", apiSuccess ? "201 OK" : (lastHttpResponseCode > 0 ? String(lastHttpResponseCode).c_str() : "OFFLINE"));
      display.printf("Buffer: %d queued\n", bufferCount);
    } else {
      display.println("WiFi: DISCONNECTED");
      display.println("Retrying connection...");
      display.printf("Buffer: %d queued\n", bufferCount);
    }
  }

  display.display();
}

unsigned long getEpochTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return (unsigned long)time(nullptr);
  }
  time(&now);
  return (unsigned long)now;
}

String createJsonPayload(float temp, float hum, bool isDhtValid, unsigned long epochTimestamp) {
  JsonDocument doc;
  doc["hiveId"] = HIVE_ID;

  if (isDhtValid) {
    doc["temperature"] = temp;
    doc["humidity"] = hum;
  } else {
    doc["temperature"] = nullptr;
    doc["humidity"] = nullptr;
  }

  // Uninstalled Physical Sensors -> Explicit nulls
  doc["weight"] = nullptr;
  doc["soundLevel"] = nullptr;
  doc["latitude"] = nullptr;
  doc["longitude"] = nullptr;
  doc["timestamp"] = epochTimestamp > 0 ? epochTimestamp : (unsigned long)time(nullptr);

  String output;
  serializeJson(doc, output);
  return output;
}

bool sendSingleTelemetry(String payload) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-IoT-API-Key", IOT_API_KEY);
  http.setTimeout(4000); // 4s timeout

  int httpCode = http.POST(payload);
  http.end();

  return (httpCode == 201 || httpCode == 200);
}

void bufferTelemetry(float temp, float hum, bool isDhtValid, unsigned long epochTimestamp) {
  if (bufferCount < MAX_BUFFER_SIZE) {
    offlineBuffer[bufferCount] = { temp, hum, isDhtValid, epochTimestamp };
    bufferCount++;
    Serial.printf("[BUFFER] Telemetry stored in offline buffer (%d/%d).\n", bufferCount, MAX_BUFFER_SIZE);
  } else {
    // Ring-buffer overwrite oldest
    for (int i = 0; i < MAX_BUFFER_SIZE - 1; i++) {
      offlineBuffer[i] = offlineBuffer[i + 1];
    }
    offlineBuffer[MAX_BUFFER_SIZE - 1] = { temp, hum, isDhtValid, epochTimestamp };
    Serial.println("[BUFFER] Buffer full. Overwrote oldest telemetry record.");
  }
}

void flushOfflineBuffer() {
  if (bufferCount == 0 || WiFi.status() != WL_CONNECTED) return;

  Serial.printf("[BUFFER] Flushing %d offline buffered records to API...\n", bufferCount);
  int sentCount = 0;

  for (int i = 0; i < bufferCount; i++) {
    String payload = createJsonPayload(offlineBuffer[i].temperature, offlineBuffer[i].humidity, offlineBuffer[i].isDhtValid, offlineBuffer[i].timestamp);
    if (sendSingleTelemetry(payload)) {
      sentCount++;
      delay(300);
    } else {
      break;
    }
  }

  if (sentCount > 0) {
    // Shift remaining
    int remaining = bufferCount - sentCount;
    for (int i = 0; i < remaining; i++) {
      offlineBuffer[i] = offlineBuffer[sentCount + i];
    }
    bufferCount = remaining;
    Serial.printf("[BUFFER] Successfully flushed %d records. Remaining: %d\n", sentCount, bufferCount);
  }
}

void sendTelemetry() {
  unsigned long nowEpoch = getEpochTime();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARN] Wi-Fi offline. Buffering telemetry locally.");
    bufferTelemetry(lastTemperature, lastHumidity, dhtReadSuccess, nowEpoch);
    apiSuccess = false;
    return;
  }

  // Attempt to flush any offline buffered readings first
  if (bufferCount > 0) {
    flushOfflineBuffer();
  }

  String payload = createJsonPayload(lastTemperature, lastHumidity, dhtReadSuccess, nowEpoch);
  Serial.println("[HTTP POST] Sending telemetry payload:");
  Serial.println(payload);

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-IoT-API-Key", IOT_API_KEY);
  http.setTimeout(4000);

  int httpCode = http.POST(payload);
  lastHttpResponseCode = httpCode;

  if (httpCode == 201 || httpCode == 200) {
    apiSuccess = true;
    Serial.printf("[HTTP SUCCESS] Telemetry recorded! Status Code: %d\n", httpCode);
  } else {
    apiSuccess = false;
    Serial.printf("[HTTP ERROR] Failed to record telemetry. Code: %d. Buffering payload.\n", httpCode);
    bufferTelemetry(lastTemperature, lastHumidity, dhtReadSuccess, nowEpoch);
  }

  http.end();
}

void handleWiFiFailure() {
  Serial.println("[WARN] Wi-Fi disconnected. Initiating background reconnection...");
  WiFi.disconnect();
  WiFi.reconnect();
}
