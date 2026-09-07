package com.nexora.honeychain;

import com.nexora.honeychain.model.*;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.model.enums.*;
import com.nexora.honeychain.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DataFoundationIntegrationTest {

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private HiveRepository hiveRepository;

    @Autowired
    private SensorReadingRepository sensorReadingRepository;

    @Autowired
    private AIAlertRepository aiAlertRepository;

    @Autowired
    private HoneyBatchRepository honeyBatchRepository;

    @Autowired
    private QualityTestRepository qualityTestRepository;

    @Autowired
    private ProcessingRecordRepository processingRecordRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private TraceabilityEventRepository traceabilityEventRepository;

    @Test
    @DisplayName("Test 1 & 2 & 3: Save Farm, Hive, and verify Farm-Hive relationship")
    void testFarmAndHivePersistence() {
        Farm farm = farmRepository.save(new Farm("FARM-TEST-01", "Test Apiary", "John Beekeeper", "North Hill", 35.0, 75.0));
        assertNotNull(farm.getId());
        assertEquals("FARM-TEST-01", farm.getFarmId());

        Hive hive = hiveRepository.save(new Hive("HIVE-TEST-001", farm, "Test Hive #1", "East Corner", 35.001, 75.001, HiveStatus.ACTIVE));
        assertNotNull(hive.getId());
        assertEquals(farm.getId(), hive.getFarm().getId());

        Optional<Hive> fetchedHive = hiveRepository.findByHiveId("HIVE-TEST-001");
        assertTrue(fetchedHive.isPresent());
        assertEquals("Test Hive #1", fetchedHive.get().getName());
        assertEquals("FARM-TEST-01", fetchedHive.get().getFarm().getFarmId());
    }

    @Test
    @DisplayName("Test 4: SensorReading correctly references Hive and handles null measurements on sensor failure")
    void testSensorReadingPersistenceAndNullHandling() {
        Farm farm = farmRepository.save(new Farm("FARM-TEST-02", "Sensor Apiary", "Alice", "South Hill", 36.0, 76.0));
        Hive hive = hiveRepository.save(new Hive("HIVE-TEST-002", farm, "Sensor Hive", "Section B", 36.001, 76.001, HiveStatus.ACTIVE));

        // Normal sensor reading
        SensorReading normalReading = sensorReadingRepository.save(new SensorReading(hive, 34.5, 55.0, 42.1, 230.0, Instant.now()));
        assertNotNull(normalReading.getId());

        // Sensor failure reading (temperature and humidity null)
        SensorReading failureReading = sensorReadingRepository.save(new SensorReading(hive, null, null, 42.2, 235.0, Instant.now()));
        assertNotNull(failureReading.getId());
        assertNull(failureReading.getTemperature());
        assertNull(failureReading.getHumidity());

        List<SensorReading> readings = sensorReadingRepository.findByHiveHiveIdOrderByTimestampDesc("HIVE-TEST-002");
        assertTrue(readings.size() >= 2);
    }

    @Test
    @DisplayName("Test 5 & 6 & 7 & 8: HoneyBatch, QualityTest, ProcessingRecord, Package and relationships")
    void testHoneyBatchWorkflowPersistence() {
        Farm farm = farmRepository.save(new Farm("FARM-TEST-03", "Harvest Apiary", "Bob", "West Hill", 37.0, 77.0));
        Hive hive = hiveRepository.save(new Hive("HIVE-TEST-003", farm, "Harvest Hive", "Section C", 37.001, 77.001, HiveStatus.ACTIVE));

        // 1. HoneyBatch
        HoneyBatch batch = honeyBatchRepository.save(new HoneyBatch("BATCH-TEST-100", hive, LocalDate.now(), 250.0, "kg", HoneyBatchStatus.HARVESTED));
        assertNotNull(batch.getId());
        assertEquals("HIVE-TEST-003", batch.getHive().getHiveId());

        // 2. QualityTest
        QualityTest qualityTest = qualityTestRepository.save(new QualityTest(batch, 16.5, 3.8, "Gold", QualityTestResult.PASS, "Inspector Mark", Instant.now()));
        assertNotNull(qualityTest.getId());
        assertEquals(batch.getId(), qualityTest.getBatch().getId());

        // 3. ProcessingRecord
        ProcessingRecord processingRecord = processingRecordRepository.save(new ProcessingRecord(batch, "Filtering", "Filtered at 200 microns", Instant.now(), "Operator Dan"));
        assertNotNull(processingRecord.getId());
        assertEquals(batch.getId(), processingRecord.getBatch().getId());

        // 4. Package
        Package pkg = packageRepository.save(new Package("PKG-TEST-500", batch, "https://honeychain.io/qr/PKG-TEST-500", PackageStatus.PACKAGED, Instant.now()));
        assertNotNull(pkg.getId());
        assertEquals(batch.getId(), pkg.getBatch().getId());

        // 5. TraceabilityEvent referencing Batch and Package
        TraceabilityEvent event = traceabilityEventRepository.save(new TraceabilityEvent(
                batch,
                pkg,
                TraceabilityEventType.PACKAGED,
                "0x123456789abcdef",
                Instant.now(),
                "0x987654321fedcba",
                BlockchainEnvironment.TEST
        ));
        assertNotNull(event.getId());
        assertEquals(batch.getId(), event.getBatch().getId());
        assertEquals(pkg.getId(), event.getPackageEntity().getId());
    }

    @Test
    @DisplayName("Test 9: AIAlert persistence and query")
    void testAIAlertPersistence() {
        Farm farm = farmRepository.save(new Farm("FARM-TEST-04", "AI Apiary", "Carol", "East Reserve", 38.0, 78.0));
        Hive hive = hiveRepository.save(new Hive("HIVE-TEST-004", farm, "AI Monitored Hive", "Zone 1", 38.001, 78.001, HiveStatus.ACTIVE));

        AIAlert alert = aiAlertRepository.save(new AIAlert(
                hive,
                75.0,
                AIAlertStatus.WARNING,
                "Abnormal hive pattern detected. Beekeeper inspection recommended.",
                "High Acoustic Swarm Buzz 210Hz",
                Instant.now()
        ));

        assertNotNull(alert.getId());
        assertEquals(AIAlertStatus.WARNING, alert.getStatus());

        List<AIAlert> alerts = aiAlertRepository.findByHiveHiveIdOrderByTimestampDesc("HIVE-TEST-004");
        assertEquals(1, alerts.size());
        assertEquals(75.0, alerts.get(0).getRiskScore());
    }

    @Test
    @DisplayName("Test 10: Unique Constraint Enforcement (Duplicate farmId throws exception)")
    void testUniqueConstraintEnforcement() {
        farmRepository.save(new Farm("FARM-UNIQUE-01", "Farm Unique 1", "Owner A", "Loc", 10.0, 20.0));

        assertThrows(Exception.class, () -> {
            farmRepository.saveAndFlush(new Farm("FARM-UNIQUE-01", "Farm Unique Duplicate", "Owner B", "Loc", 10.0, 20.0));
        });
    }
}
