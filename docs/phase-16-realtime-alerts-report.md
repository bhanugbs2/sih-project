# Phase 16 — Real-Time Monitoring, Alert Management & Notification Pipeline Report

## 1. Alert Architecture
The alert pipeline connects ESP32 sensor telemetry ingestion with automated AI anomaly screening, persistent alert tracking, and multi-client visualization across React web and Flutter mobile applications.

```
ESP32 Telemetry (POST /api/sensors)
          │
          ▼
Spring Boot SensorReadingService
          │
          ▼
HiveAnomalyDetector (AI/ML + Rule Engine)
          │
          ▼
AIAlertService (Deduplication Cooldown Check)
          │
          ├── Persistent PostgreSQL Store (ai_alerts table)
          └── NotificationService Abstraction (InAppNotificationServiceImpl)
          │
          ├── REST API (/api/ai/alerts, /api/ai/alerts/unread, /api/ai/alerts/{id}/acknowledge)
          │
          ├── React Web Application (Auto-refreshing dashboard & alerts page)
          └── Flutter Mobile Application (Auto-refreshing mobile dashboard & alerts screen)
```

## 2. Alert Lifecycle
The complete alert lifecycle flows through 4 state transitions without deleting historical record data:

1. **TRIGGERED / PERSISTED**: Created automatically by `AIAlertService` when `HiveAnomalyDetector` identifies an anomaly or missing sensor telemetry. Initializes with `isRead = false` and `isAcknowledged = false`.
2. **UNREAD**: Displayed with prominent "NEW / UNREAD" badges in React and Flutter. Included in backend `/api/ai/alerts/unread/count`.
3. **READ**: Triggered when an authorized user opens or views the alert (`PATCH /api/ai/alerts/{id}/read`). Sets `isRead = true` and records timestamp `readAt`.
4. **ACKNOWLEDGED**: Triggered when a Beekeeper, Admin, or Inspector explicitly confirms inspection (`PATCH /api/ai/alerts/{id}/acknowledge`). Sets `isRead = true`, `isAcknowledged = true`, records timestamp `acknowledgedAt`, and logs `acknowledgedBy` user. Historical record remains permanently in database for audit history.

## 3. Severity Model
- **NORMAL**: Environmental telemetry within baseline parameters (34.0°C–36.0°C temp, 50%–65% humidity). No alert record created.
- **WARNING**: Unusual parameter drift or missing DHT22 sensor readings. Message wording: *"Environmental parameter drift detected. Beekeeper inspection recommended."*
- **CRITICAL**: Strong abnormal pattern requiring prompt inspection (e.g. thermal spike > 38.0°C). Message wording: *"Abnormal hive pattern detected. Immediate beekeeper inspection recommended."*

> [!IMPORTANT]
> Severity levels do NOT make medical or definitive disease diagnoses (e.g. Varroa infestation or American Foulbrood). All alerts use non-definitive decision support terminology recommending beekeeper inspection.

## 4. Alert Deduplication Strategy
To prevent alert fatigue and database bloat when persistent abnormal telemetry is reported consecutively:
- **15-Minute Cooldown Window**: `AIAlertService` evaluates the latest alert generated for the same hive. If an alert with identical status (`WARNING` or `CRITICAL`) exists within 15 minutes, duplicate alert creation is suppressed.
- **Severity Escalation Exemption**: If telemetry severity escalates (e.g. from `WARNING` to `CRITICAL`), a new alert is generated immediately regardless of cooldown time.

## 5. Read & Acknowledgment Management
- **Mark as Read**: `PATCH /api/ai/alerts/{id}/read` sets `is_read = true` and `read_at = CURRENT_TIMESTAMP`.
- **Acknowledge**: `PATCH /api/ai/alerts/{id}/acknowledge` sets `is_read = true`, `is_acknowledged = true`, `acknowledged_at = CURRENT_TIMESTAMP`, and `acknowledged_by = username` extracted from Spring Security JWT context.

## 6. Backend REST APIs
- `GET /api/ai/alerts`: Returns all AI alerts ordered newest first (`hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')`).
- `GET /api/ai/alerts/unread`: Returns unread AI alerts ordered newest first.
- `GET /api/ai/alerts/unread/count`: Returns exact unread count JSON `{ "count": N }`.
- `PATCH /api/ai/alerts/{id}/read`: Marks alert as read.
- `PATCH /api/ai/alerts/{id}/acknowledge`: Acknowledges alert.

## 7. React Web Integration
- **Dashboard (`DashboardPage.tsx`)**: Displays unread alert count metric card, auto-refreshing polling loop (every 15s), freshness indicator (*"Auto-refreshing — Updated X seconds ago"*), and recent alerts list with inline acknowledgment action.
- **Alerts Page (`AlertsPage.tsx`)**: Full alert management UI with filter tabs (All, Unread, Critical, Acknowledged), NEW badge for unread alerts, contributing factors, model version, timestamps, and action buttons.

## 8. Flutter Mobile Integration
- **Model & Service (`ai_alert.dart`, `ai_service.dart`)**: Updated `AIAlert` parsing and added `getUnreadAlertCount()`, `markAlertRead()`, `acknowledgeAlert()` network methods.
- **Mobile Dashboard (`dashboard_screen.dart`)**: Displays unread alert count badge and auto-refreshes every 15s using `Timer.periodic`.
- **Mobile Alerts Screen (`alerts_screen.dart`)**: Displays full alert details, NEW badges, contributing factors, model version, timestamp, and interactive Mark Read and Acknowledge buttons.

## 9. Polling & Real-Time Strategy
- **Web & Mobile**: Both React and Flutter applications use periodic polling (15-second interval) to update dashboard metrics and alert feeds automatically without requiring manual browser or screen refresh.
- **UI Labeling**: Clearly labeled as *"Auto-refreshing (Updated X seconds ago)"* rather than misleading claims of WebSocket connections.

## 10. Telemetry Freshness
Telemetry status is derived dynamically based on sensor timestamp vs server time:
- **ONLINE**: Telemetry recorded within < 5 minutes.
- **STALE**: Telemetry recorded 5 to 30 minutes ago.
- **OFFLINE**: No telemetry received in > 30 minutes.

Refreshing the UI state executes an API poll; it does NOT alter historical sensor timestamps.

## 11. Sensor Failure & Deferred Sensors
- **DHT22 Failure Handling**: If temperature/humidity telemetry is missing (`null` or invalid hardware error -999), the system generates a `SENSOR_FAILURE` alert: *"DHT22 reading unavailable. Sensor inspection recommended."* It is never misclassified as high or low thermal anomaly.
- **Deferred Sensors**: Missing data for deferred hardware (HX711 weight, INMP441 sound, GPS) is ignored and does NOT generate false anomaly alerts.

## 12. Security & Role Control
- All alert endpoints are protected with Spring Security JWT and `@PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")`.
- Public customer verification (`/api/verify/{packageId}`) remains accessible without authentication and strictly excludes internal AI alerts, user details, and apiary telemetry history.

## 13. Performance Optimizations
- DB Indices added on `ai_alerts(is_read)`, `ai_alerts(is_acknowledged)`, and `ai_alerts(hive_id, status)`.
- Backend `/api/ai/alerts/unread/count` uses lightweight SQL count query (`countByIsReadFalse()`).
- Polling intervals capped at 15 seconds to prevent backend database connection exhaustion.

## 14. End-to-End Verification Test Flow
1. POST valid telemetry (`temp=35.0, hum=55.0`) -> System status NORMAL.
2. POST abnormal telemetry (`temp=42.0, hum=55.0`) -> `HiveAnomalyDetector` flags CRITICAL anomaly -> Alert persisted -> Unread count increments -> `InAppNotificationServiceImpl` logs notification.
3. React Web Dashboard & AlertsPage auto-refresh -> Alert displayed with NEW badge.
4. Flutter Mobile Dashboard & AlertsScreen auto-refresh -> Unread count badge updates.
5. Beekeeper triggers Acknowledge via UI -> API updates `is_read = true`, `is_acknowledged = true`, `acknowledged_by = username`.
6. POST identical abnormal telemetry within 15 minutes -> Deduplication cooldown suppresses duplicate alert generation.

## 15. Automated Test Results
- **Spring Boot Backend**: 76 tests passed, 0 failures, 0 errors (`Phase16AlertManagementTest`, `DataFoundationIntegrationTest`, `Phase6AIIntegrationTest`, `Phase7WorkflowIntegrationTest`, `Phase8BlockchainIntegrationTest`).
- **React Frontend**: `npm run build` completed cleanly (2231 modules transformed, 0 errors).
- **Flutter Mobile**: `flutter analyze` 0 issues found; `flutter test` 13 tests passed!

## 16. Known Limitations
- Background Push Notifications (FCM / APNs) require vendor credentials and are intentionally deferred in accordance with Phase 16 scope requirements. Currently supported via automatic in-app polling.

## 17. Future Push Notification Architecture
The notification pipeline is abstracted via `NotificationService`:

```java
public interface NotificationService {
    void dispatchNotification(AIAlert alert);
}
```

Future providers (Firebase Cloud Messaging, AWS SNS, SendGrid Email, Twilio SMS) can be plugged into `dispatchNotification` without refactoring alert evaluation or persistence logic.
