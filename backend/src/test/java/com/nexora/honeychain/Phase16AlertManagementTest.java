package com.nexora.honeychain;

import com.nexora.honeychain.dto.AIAlertResponse;
import com.nexora.honeychain.dto.CreateFarmRequest;
import com.nexora.honeychain.dto.CreateHiveRequest;
import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import com.nexora.honeychain.model.enums.AIAlertStatus;
import com.nexora.honeychain.repository.AIAlertRepository;
import com.nexora.honeychain.service.AIAlertService;
import com.nexora.honeychain.service.FarmService;
import com.nexora.honeychain.service.HiveService;
import com.nexora.honeychain.service.SensorReadingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class Phase16AlertManagementTest {

    @Autowired
    private SensorReadingService sensorReadingService;

    @Autowired
    private AIAlertService aiAlertService;

    @Autowired
    private AIAlertRepository aiAlertRepository;

    @Autowired
    private FarmService farmService;

    @Autowired
    private HiveService hiveService;

    private static final String TEST_FARM_ID = "FARM-P16-TEST";
    private static final String TEST_HIVE_ID = "HIVE-P16-TEST";

    @BeforeEach
    void setupData() {
        aiAlertRepository.deleteAll();

        try {
            farmService.getFarmByFarmId(TEST_FARM_ID);
        } catch (Exception e) {
            farmService.createFarm(new CreateFarmRequest(TEST_FARM_ID, "Phase 16 Apiary Farm", "Test Owner", "Himachal Apiary", 31.1, 77.1));
        }

        try {
            hiveService.getHiveByHiveId(TEST_HIVE_ID);
        } catch (Exception e) {
            hiveService.createHive(new CreateHiveRequest(TEST_HIVE_ID, TEST_FARM_ID, "Hive Phase 16", "North Field", 31.1, 77.1, null));
        }
    }

    @Test
    @DisplayName("Test 1: Abnormally high temperature generates AI anomaly alert")
    void testSensorTelemetryIngestionGeneratesAlert() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setHiveId(TEST_HIVE_ID);
        request.setTemperature(42.0);
        request.setHumidity(55.0);

        sensorReadingService.recordSensorReading(request);

        List<AIAlertResponse> alerts = aiAlertService.getHiveAlerts(TEST_HIVE_ID, 10);
        assertFalse(alerts.isEmpty(), "Alert should be created for abnormal 42.0°C temperature");

        AIAlertResponse alert = alerts.get(0);
        assertEquals(AIAlertStatus.CRITICAL, alert.getStatus());
        assertTrue(alert.getMessage().contains("Abnormal hive pattern detected"), "Message should use non-definitive inspection wording");
        assertFalse(alert.isRead());
        assertFalse(alert.isAcknowledged());
    }

    @Test
    @DisplayName("Test 2: Deduplication cooldown prevents identical duplicate alerts within 15 mins")
    void testAlertDeduplication() {
        CreateSensorReadingRequest req1 = new CreateSensorReadingRequest();
        req1.setHiveId(TEST_HIVE_ID);
        req1.setTemperature(41.5);
        req1.setHumidity(55.0);

        sensorReadingService.recordSensorReading(req1);

        List<AIAlertResponse> alertsAfterFirst = aiAlertService.getHiveAlerts(TEST_HIVE_ID, 10);
        assertEquals(1, alertsAfterFirst.size());

        // Immediately send second reading with same persistent abnormal status
        CreateSensorReadingRequest req2 = new CreateSensorReadingRequest();
        req2.setHiveId(TEST_HIVE_ID);
        req2.setTemperature(41.8);
        req2.setHumidity(54.0);

        sensorReadingService.recordSensorReading(req2);

        List<AIAlertResponse> alertsAfterSecond = aiAlertService.getHiveAlerts(TEST_HIVE_ID, 10);
        assertEquals(1, alertsAfterSecond.size(), "Deduplication cooldown should prevent generating duplicate alert for persistent CRITICAL condition");
    }

    @Test
    @DisplayName("Test 3: Missing DHT22 sensor data generates SENSOR_FAILURE alert")
    void testSensorFailureAlert() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setHiveId(TEST_HIVE_ID);
        request.setTemperature(null);
        request.setHumidity(null);

        sensorReadingService.recordSensorReading(request);

        List<AIAlertResponse> alerts = aiAlertService.getHiveAlerts(TEST_HIVE_ID, 10);
        assertFalse(alerts.isEmpty());

        AIAlertResponse alert = alerts.get(0);
        assertEquals("SENSOR_FAILURE", alert.getAlertType());
        assertEquals("DHT22 reading unavailable. Sensor inspection recommended.", alert.getMessage());
    }

    @Test
    @DisplayName("Test 4: Unread alert count, mark as read, and alert acknowledgment lifecycle")
    void testAlertReadAndAcknowledgeLifecycle() {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest();
        request.setHiveId(TEST_HIVE_ID);
        request.setTemperature(39.5);
        request.setHumidity(55.0);

        sensorReadingService.recordSensorReading(request);

        long initialUnread = aiAlertService.getUnreadCount();
        assertTrue(initialUnread >= 1, "Unread count should be at least 1");

        List<AIAlertResponse> unreadAlerts = aiAlertService.getUnreadAlerts();
        String alertId = unreadAlerts.get(0).getId();

        // 1. Mark Read
        AIAlertResponse readAlert = aiAlertService.markAsRead(alertId);
        assertTrue(readAlert.isRead(), "Alert should be marked as read");
        assertNotNull(readAlert.getReadAt());

        // 2. Acknowledge
        AIAlertResponse ackAlert = aiAlertService.acknowledgeAlert(alertId, "TestBeekeeper");
        assertTrue(ackAlert.isAcknowledged(), "Alert should be acknowledged");
        assertEquals("TestBeekeeper", ackAlert.getAcknowledgedBy());
        assertNotNull(ackAlert.getAcknowledgedAt());
    }
}
