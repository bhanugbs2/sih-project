/*
 * HoneyChain ESP32 IoT Node Firmware
 * Target Hardware: ESP32-WROOM-32 + DHT22 Temperature/Humidity Sensor + SSD1306 OLED (128x64 I2C)
 * 
 * SIH Problem Statement: SIH26021
 * Team: Nexora
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

// Configuration Constants (Override via platformio.ini or env)
#ifndef HIVE_ID
#define HIVE_ID "hive-001"
#endif

#ifndef IOT_API_KEY
#define IOT_API_KEY "HoneyChain-IoT-Device-Key-2026"
#endif

// Wi-Fi & API Server Credentials (Configure in iot/.env)
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "http://192.168.1.100:8080/api/sensors"; // Replace 192.168.1.100 with PC LAN IP

// Pin Definitions
#define DHTPIN 4
#define DHTTYPE DHT22

#define OLED_SDA 21
#define OLED_SCL 22
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Sampling & Telemetry Intervals
const unsigned long SENSOR_READ_INTERVAL = 5000;   // 5 seconds
const unsigned long TELEMETRY_SEND_INTERVAL = 10000; // 10 seconds
const unsigned long WIFI_RECONNECT_INTERVAL = 10000; // 10 seconds

// Hardware Peripherals
DHT dht(DHTPIN, DHTTYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// State Variables
float lastTemperature = 0.0;
float lastHumidity = 0.0;
bool dhtReadSuccess = false;
bool apiSuccess = false;
int lastHttpResponseCode = 0;
unsigned long lastSensorReadTime = 0;
unsigned long lastTelemetrySendTime = 0;
unsigned long lastWiFiCheckTime = 0;

// Function Prototypes
void setupWiFi();
void setupNTP();
bool readSensors();
void displaySensorData();
String createTelemetryPayload(unsigned long epochTimestamp);
void sendTelemetry();
void handleWiFiFailure();
unsigned long getEpochTime();

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=========================================");
  Serial.println("   HONEYCHAIN ESP32 IOT NODE FIRMWARE   ");
  Serial.println("=========================================");
  Serial.printf("Hive ID: %s\n", HIVE_ID);

  // Initialize Wire & OLED Display
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("[ERROR] SSD1306 OLED initialization failed!"));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 10);
    display.println("HoneyChain Node");
    display.println("Initializing...");
    display.display();
  }

  // Initialize DHT22 Sensor
  dht.begin();
  Serial.println("[INFO] DHT22 sensor initialized.");

  // Connect to Wi-Fi
  setupWiFi();

  // Initialize NTP Time Sync
  if (WiFi.status() == WL_CONNECTED) {
    setupNTP();
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // Periodically check Wi-Fi connection
  if (currentMillis - lastWiFiCheckTime >= WIFI_RECONNECT_INTERVAL) {
    lastWiFiCheckTime = currentMillis;
    if (WiFi.status() != WL_CONNECTED) {
      handleWiFiFailure();
    }
  }

  // Read DHT22 Sensor every 5 seconds
  if (currentMillis - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    lastSensorReadTime = currentMillis;
    dhtReadSuccess = readSensors();
    displaySensorData();
  }

  // Send Telemetry Payload every 10 seconds
  if (currentMillis - lastTelemetrySendTime >= TELEMETRY_SEND_INTERVAL) {
    lastTelemetrySendTime = currentMillis;
    if (WiFi.status() == WL_CONNECTED) {
      sendTelemetry();
    } else {
      Serial.println("[WARN] Telemetry skipped: Wi-Fi disconnected.");
    }
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
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[SUCCESS] Wi-Fi connected successfully!");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WARN] Wi-Fi connection failed. Will retry in background.");
  }
}

void setupNTP() {
  Serial.println("[INFO] Synchronizing NTP time (pool.ntp.org)...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  time_t now = time(nullptr);
  int retry = 0;
  while (now < 8 * 3600 * 2 && retry < 10) {
    delay(500);
    now = time(nullptr);
    retry++;
  }
  
  if (now > 8 * 3600 * 2) {
    Serial.printf("[SUCCESS] NTP Time synchronized: %ld UTC\n", (long)now);
  } else {
    Serial.println("[WARN] NTP Time sync timeout. Falling back to timestamp system.");
  }
}

bool readSensors() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("[ERROR] Failed to read from DHT22 sensor!");
    return false;
  }

  lastTemperature = temp;
  lastHumidity = hum;

  Serial.printf("[SENSOR] Temp: %.1f C | Humidity: %.1f %%\n", lastTemperature, lastHumidity);
  return true;
}

void displaySensorData() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("HONEYCHAIN");
  display.printf("Hive: %s\n", HIVE_ID);
  display.println("---------------------");

  if (!dhtReadSuccess) {
    display.println("DHT22 ERROR!");
    display.println("Check Sensor Wire");
  } else {
    display.printf("Temp:     %.1f C\n", lastTemperature);
    display.printf("Humidity: %.1f %%\n", lastHumidity);
  }

  display.println("---------------------");
  if (WiFi.status() == WL_CONNECTED) {
    display.printf("WiFi: OK | API: %s\n", apiSuccess ? "201 OK" : (lastHttpResponseCode > 0 ? String(lastHttpResponseCode).c_str() : "SENDING"));
  } else {
    display.println("WiFi: DISCONNECTED");
  }

  display.display();
}

unsigned long getEpochTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    // Fallback if NTP time unavailable
    return (unsigned long)time(nullptr);
  }
  time(&now);
  return (unsigned long)now;
}

String createTelemetryPayload(unsigned long epochTimestamp) {
  JsonDocument doc;
  doc["hiveId"] = HIVE_ID;

  if (dhtReadSuccess) {
    doc["temperature"] = lastTemperature;
    doc["humidity"] = lastHumidity;
  } else {
    doc["temperature"] = nullptr;
    doc["humidity"] = nullptr;
  }

  // Physical sensors not currently available -> Explicit nulls
  doc["weight"] = nullptr;
  doc["soundLevel"] = nullptr;
  doc["latitude"] = nullptr;
  doc["longitude"] = nullptr;
  doc["timestamp"] = epochTimestamp > 0 ? epochTimestamp : (unsigned long)time(nullptr);

  String output;
  serializeJson(doc, output);
  return output;
}

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-IoT-API-Key", IOT_API_KEY);
  http.setTimeout(5000); // 5 sec timeout

  unsigned long nowEpoch = getEpochTime();
  String jsonPayload = createTelemetryPayload(nowEpoch);

  Serial.println("[HTTP] Sending Telemetry Payload to Spring Boot Backend:");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);
  lastHttpResponseCode = httpResponseCode;

  if (httpResponseCode == 201 || httpResponseCode == 200) {
    apiSuccess = true;
    Serial.printf("[HTTP SUCCESS] Telemetry uploaded successfully! Response code: %d\n", httpResponseCode);
  } else {
    apiSuccess = false;
    Serial.printf("[HTTP ERROR] Failed to upload telemetry. Response code: %d\n", httpResponseCode);
    if (httpResponseCode == 400) {
      Serial.println("Reason: Bad Request (Invalid payload or sensor range)");
    } else if (httpResponseCode == 401 || httpResponseCode == 403) {
      Serial.println("Reason: Authentication / Authorization rejection");
    } else if (httpResponseCode == 404) {
      Serial.println("Reason: Endpoint not found or Hive ID missing");
    } else if (httpResponseCode < 0) {
      Serial.printf("Reason: Connection error / timeout (%s)\n", http.errorToString(httpResponseCode).c_str());
    }
  }

  http.end();
}

void handleWiFiFailure() {
  Serial.println("[WARN] Wi-Fi lost. Attempting background reconnection...");
  WiFi.disconnect();
  WiFi.reconnect();
}
