package com.nexora.honeychain.config;

import com.nexora.honeychain.model.*;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.model.enums.*;
import com.nexora.honeychain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
@Profile({"dev", "demo", "default"})
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final FarmRepository farmRepository;
    private final HiveRepository hiveRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final AIAlertRepository aiAlertRepository;
    private final HoneyBatchRepository honeyBatchRepository;
    private final QualityTestRepository qualityTestRepository;
    private final ProcessingRecordRepository processingRecordRepository;
    private final PackageRepository packageRepository;
    private final TraceabilityEventRepository traceabilityEventRepository;

    public DatabaseSeeder(
            FarmRepository farmRepository,
            HiveRepository hiveRepository,
            SensorReadingRepository sensorReadingRepository,
            AIAlertRepository aiAlertRepository,
            HoneyBatchRepository honeyBatchRepository,
            QualityTestRepository qualityTestRepository,
            ProcessingRecordRepository processingRecordRepository,
            PackageRepository packageRepository,
            TraceabilityEventRepository traceabilityEventRepository) {
        this.farmRepository = farmRepository;
        this.hiveRepository = hiveRepository;
        this.sensorReadingRepository = sensorReadingRepository;
        this.aiAlertRepository = aiAlertRepository;
        this.honeyBatchRepository = honeyBatchRepository;
        this.qualityTestRepository = qualityTestRepository;
        this.processingRecordRepository = processingRecordRepository;
        this.packageRepository = packageRepository;
        this.traceabilityEventRepository = traceabilityEventRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (farmRepository.count() > 0) {
            log.info("DEMO DATA ALREADY PRESENT - Skipping initial seeding.");
            return;
        }

        log.info("=== GENERATING DEMO DATA FOR HONEYCHAIN DATA FOUNDATION ===");

        // 1. Create 3 Farms
        Farm farm1 = farmRepository.save(new Farm("FARM-HIM-01", "Himalayan Organic Apiary", "Dr. Rajesh Sharma", "Himachal Pradesh, India", 31.1048, 77.1734));
        Farm farm2 = farmRepository.save(new Farm("FARM-ALP-02", "Alpine Meadows Apiary", "Elena Vance", "Valley Ridge, Sector 4", 32.2432, 77.1892));
        Farm farm3 = farmRepository.save(new Farm("FARM-VAL-03", "Valley Blossom Apiary", "Aarav Patel", "Green Valley Reserve", 31.2500, 76.9000));

        // 2. Create 3 Hives
        Hive hive1 = hiveRepository.save(new Hive("HIVE-HIM-001", farm1, "East Ridge Hive #1", "Section A", 31.1050, 77.1736, HiveStatus.ACTIVE));
        Hive hive2 = hiveRepository.save(new Hive("HIVE-HIM-002", farm1, "West Slope Hive #2", "Section A", 31.1045, 77.1732, HiveStatus.ACTIVE));
        Hive hive3 = hiveRepository.save(new Hive("HIVE-VAL-003", farm3, "Valley Meadow Hive #3", "Section B", 31.2510, 76.9010, HiveStatus.MAINTENANCE));

        // 3. Create 24 SensorReadings (including simulated null sensor measurements for failure handling)
        Instant now = Instant.now();
        for (int i = 0; i < 20; i++) {
            Instant timestamp = now.minus(i * 30, ChronoUnit.MINUTES);
            sensorReadingRepository.save(new SensorReading(
                    hive1,
                    34.0 + (i % 3) * 0.5,
                    55.0 + (i % 5) * 1.2,
                    42.0 + i * 0.1,
                    230.0 + (i % 4) * 5.0,
                    timestamp
            ));
        }

        // Add 4 sensor readings with missing/null sensor values (simulating hardware sensor failures)
        sensorReadingRepository.save(new SensorReading(hive2, null, 58.0, 45.2, 240.0, now.minus(2, ChronoUnit.HOURS))); // Temperature sensor failure
        sensorReadingRepository.save(new SensorReading(hive2, 35.1, null, 45.3, 242.0, now.minus(1, ChronoUnit.HOURS))); // Humidity sensor failure
        sensorReadingRepository.save(new SensorReading(hive3, 33.8, 62.0, null, 210.0, now.minus(3, ChronoUnit.HOURS))); // Weight sensor failure
        sensorReadingRepository.save(new SensorReading(hive3, 34.2, 60.0, 38.5, null, now.minus(30, ChronoUnit.MINUTES))); // Microphone acoustic failure

        // 4. Create AI Alerts
        aiAlertRepository.save(new AIAlert(
                hive1,
                15.0,
                AIAlertStatus.NORMAL,
                "Hive status optimal. Internal temperature and acoustics within standard thresholds.",
                "Thermal Stability: 98%, Frequency Band: 235Hz Normal Swarm Index",
                now.minus(4, ChronoUnit.HOURS)
        ));

        aiAlertRepository.save(new AIAlert(
                hive3,
                68.5,
                AIAlertStatus.WARNING,
                "Abnormal hive pattern detected. Beekeeper inspection recommended.",
                "Acoustic shift to 210Hz indicates potential queen distress / pre-swarm activity.",
                now.minus(1, ChronoUnit.HOURS)
        ));

        // 5. Create 2 Honey Batches
        HoneyBatch batch1 = honeyBatchRepository.save(new HoneyBatch(
                "HC-BATCH-2026-VALLEY-09",
                hive1,
                LocalDate.of(2026, 8, 28),
                450.0,
                "kg",
                HoneyBatchStatus.PACKAGED
        ));

        HoneyBatch batch2 = honeyBatchRepository.save(new HoneyBatch(
                "HC-BATCH-2026-VALLEY-10",
                hive2,
                LocalDate.of(2026, 9, 2),
                320.0,
                "kg",
                HoneyBatchStatus.QUALITY_VERIFIED
        ));

        // 6. Create Quality Test Records
        qualityTestRepository.save(new QualityTest(
                batch1,
                16.2,
                3.85,
                "Amber Gold",
                QualityTestResult.PASS,
                "Lab Analyst S. Verma - Cert #8891",
                now.minus(5, ChronoUnit.DAYS)
        ));

        qualityTestRepository.save(new QualityTest(
                batch2,
                15.8,
                3.90,
                "Light Floral Amber",
                QualityTestResult.PASS,
                "Lab Analyst S. Verma - Cert #8892",
                now.minus(2, ChronoUnit.DAYS)
        ));

        // 7. Create Processing Records
        processingRecordRepository.save(new ProcessingRecord(
                batch1,
                "Cold Extraction & Micro-Filtration",
                "Raw honey extracted at 36.5°C maximum temperature, filtered using 200-micron mesh to retain natural pollen grains.",
                now.minus(4, ChronoUnit.DAYS),
                "Processing Manager K. Singh"
        ));

        // 8. Create Packages
        Package package1 = packageRepository.save(new Package(
                "HC-PKG-2026-001",
                batch1,
                "https://honeychain.io/verify/HC-QR-2026-88912",
                PackageStatus.PACKAGED,
                now.minus(3, ChronoUnit.DAYS)
        ));

        Package package2 = packageRepository.save(new Package(
                "HC-PKG-2026-002",
                batch1,
                "https://honeychain.io/verify/HC-QR-2026-88913",
                PackageStatus.PACKAGED,
                now.minus(3, ChronoUnit.DAYS)
        ));

        // 9. Create Traceability Events
        traceabilityEventRepository.save(new TraceabilityEvent(
                batch1,
                null,
                TraceabilityEventType.HARVESTED,
                "0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
                now.minus(7, ChronoUnit.DAYS),
                "0x8f2a4e719c8d6e3f5b1a0d9c8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f",
                BlockchainEnvironment.DEVELOPMENT
        ));

        traceabilityEventRepository.save(new TraceabilityEvent(
                batch1,
                package1,
                TraceabilityEventType.PACKAGED,
                "0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
                now.minus(3, ChronoUnit.DAYS),
                "0x9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f",
                BlockchainEnvironment.DEVELOPMENT
        ));

        log.info("DEMO DATA GENERATED SUCCESSFULLY!");
        log.info("Loaded: 3 Farms, 3 Hives, 24 Sensor Readings (4 with missing sensor values), 2 Batches, 2 Quality Tests, 1 Processing Log, 2 Packages, 2 Traceability Events, 2 AI Alerts.");
    }
}
