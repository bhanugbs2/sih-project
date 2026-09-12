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

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
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
            UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            FarmRepository farmRepository,
            HiveRepository hiveRepository,
            SensorReadingRepository sensorReadingRepository,
            AIAlertRepository aiAlertRepository,
            HoneyBatchRepository honeyBatchRepository,
            QualityTestRepository qualityTestRepository,
            ProcessingRecordRepository processingRecordRepository,
            PackageRepository packageRepository,
            TraceabilityEventRepository traceabilityEventRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
        // Seed Demo Users if missing
        seedDemoUsers();

        if (farmRepository.count() > 0) {
            log.info("DEMO DATA ALREADY PRESENT - Checking for missing demo batches & cleaning obsolete packages.");
            seedMissingDemoBatches();
            cleanupObsoleteDemoPackages();
            return;
        }


        log.info("=== GENERATING DEMO DATA FOR HONEYCHAIN DATA FOUNDATION & PHASE 7 WORKFLOW ===");

        // 1. Create 3 Farms
        Farm farm1 = farmRepository.save(new Farm("FARM-HIM-01", "Himalayan Organic Apiary", "Dr. Rajesh Sharma", "Himachal Pradesh, India", 31.1048, 77.1734));
        Farm farm2 = farmRepository.save(new Farm("FARM-ALP-02", "Alpine Meadows Apiary", "Elena Vance", "Valley Ridge, Sector 4", 32.2432, 77.1892));
        Farm farm3 = farmRepository.save(new Farm("FARM-VAL-03", "Valley Blossom Apiary", "Aarav Patel", "Green Valley Reserve", 31.2500, 76.9000));

        // 2. Create 3 Hives (including physical ESP32 hive-001)
        Hive hive0 = hiveRepository.save(new Hive("hive-001", farm1, "Physical ESP32 Smart Hive #1", "Section A", 31.1048, 77.1734, HiveStatus.ACTIVE));
        Hive hive1 = hiveRepository.save(new Hive("HIVE-HIM-001", farm1, "East Ridge Hive #1", "Section A", 31.1050, 77.1736, HiveStatus.ACTIVE));
        Hive hive2 = hiveRepository.save(new Hive("HIVE-HIM-002", farm1, "West Slope Hive #2", "Section A", 31.1045, 77.1732, HiveStatus.ACTIVE));
        Hive hive3 = hiveRepository.save(new Hive("HIVE-VAL-003", farm3, "Valley Meadow Hive #3", "Section B", 31.2510, 76.9010, HiveStatus.MAINTENANCE));

        // 3. Create SensorReadings
        Instant now = Instant.now();
        for (int i = 0; i < 20; i++) {
            Instant timestamp = now.minus(i * 30, ChronoUnit.MINUTES);
            sensorReadingRepository.save(new SensorReading(
                    hive1,
                    34.0 + (i % 3) * 0.5,
                    55.0 + (i % 5) * 1.2,
                    null, // Load Cell Deferred
                    null, // Microphone Deferred
                    timestamp
            ));
        }

        // Add sensor readings simulating optional/deferred hardware
        sensorReadingRepository.save(new SensorReading(hive2, 35.1, 58.0, null, null, now.minus(1, ChronoUnit.HOURS)));

        // 4. Create AI Alerts
        aiAlertRepository.save(new AIAlert(
                hive1,
                15.0,
                AIAlertStatus.NORMAL,
                "Hive status optimal. Internal temperature and humidity within standard thresholds.",
                "Thermal Stability: 98%, Humidity: 56.5% Normal Range",
                now.minus(4, ChronoUnit.HOURS)
        ));

        aiAlertRepository.save(new AIAlert(
                hive3,
                68.5,
                AIAlertStatus.WARNING,
                "Abnormal hive pattern detected. Beekeeper inspection recommended.",
                "Thermal spike to 38.2°C indicates potential hive overheating / brood stress.",
                now.minus(1, ChronoUnit.HOURS)
        ));

        // 5. Create 3 Honey Batches for Phase 7 Demo
        // Batch 1: Passed Quality, Processed, Ready for Packaging
        HoneyBatch batch1 = honeyBatchRepository.save(new HoneyBatch(
                "HC-BATCH-2026-VALLEY-09",
                hive1,
                LocalDate.of(2026, 8, 28),
                450.0,
                "kg",
                "High yield summer bloom harvest from Himalayan supers.",
                "Manual Harvest Quantity",
                HoneyBatchStatus.READY_FOR_PACKAGING
        ));

        // Batch 2: Requires Review (Blocked from processing due to elevated moisture)
        HoneyBatch batch2 = honeyBatchRepository.save(new HoneyBatch(
                "HC-BATCH-2026-VALLEY-10",
                hive2,
                LocalDate.of(2026, 9, 2),
                320.0,
                "kg",
                "Monsoon end harvest, secondary super extraction.",
                "Manual Harvest Quantity",
                HoneyBatchStatus.REQUIRES_REVIEW
        ));

        // Batch 3: Passed Quality, Currently in Processing
        HoneyBatch batch3 = honeyBatchRepository.save(new HoneyBatch(
                "HC-BATCH-2026-VALLEY-11",
                hive0,
                LocalDate.of(2026, 9, 7),
                180.0,
                "kg",
                "Fresh morning harvest from Physical ESP32 Smart Hive #1.",
                "Manual Harvest Quantity",
                HoneyBatchStatus.PROCESSING
        ));

        // 6. Create Quality Test Records
        qualityTestRepository.save(new QualityTest(
                batch1,
                16.2,
                3.85,
                "Amber Gold",
                "Measured parameters meet international honey standards.",
                QualityTestResult.PASS,
                "Lab Analyst S. Verma - Cert #8891",
                now.minus(5, ChronoUnit.DAYS)
        ));

        qualityTestRepository.save(new QualityTest(
                batch2,
                21.5,
                3.90,
                "Light Amber",
                "Moisture content exceeds 20.0% max threshold. Requires secondary lab review before processing.",
                QualityTestResult.REQUIRES_REVIEW,
                "Lab Analyst S. Verma - Cert #8892",
                now.minus(2, ChronoUnit.DAYS)
        ));

        qualityTestRepository.save(new QualityTest(
                batch3,
                16.8,
                4.10,
                "Golden Blossom",
                "High purity score. Optimal acidity and moisture levels.",
                QualityTestResult.PASS,
                "Inspector M. Kumar - Cert #9904",
                now.minus(1, ChronoUnit.DAYS)
        ));

        // 7. Create Processing Records
        processingRecordRepository.save(new ProcessingRecord(
                batch1,
                "EXTRACTION",
                "Processing Manager K. Singh",
                now.minus(4, ChronoUnit.DAYS),
                now.minus(4, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS),
                36.5,
                "Raw cold extraction at 36.5°C maximum temperature to preserve enzymes."
        ));

        processingRecordRepository.save(new ProcessingRecord(
                batch1,
                "FILTRATION",
                "Processing Manager K. Singh",
                now.minus(3, ChronoUnit.DAYS),
                now.minus(3, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS),
                35.0,
                "Filtered using 200-micron mesh screen to retain natural pollen grains."
        ));

        processingRecordRepository.save(new ProcessingRecord(
                batch3,
                "EXTRACTION",
                "Operator J. Patel",
                now.minus(12, ChronoUnit.HOURS),
                now.minus(10, ChronoUnit.HOURS),
                36.0,
                "Initial centrifugal extraction from uncapped frames."
        ));

        // 8. Create Packages (for Batch 1)
        Package package1 = packageRepository.save(new Package(
                "HC-PKG-2026-001",
                batch1,
                "https://honeychain.io/verify/HC-PKG-2026-001",
                PackageStatus.PACKAGED,
                now.minus(2, ChronoUnit.DAYS)
        ));

        // 9. Create Traceability Events for Phase 7 Workflow Timeline
        traceabilityEventRepository.save(new TraceabilityEvent(batch1, null, TraceabilityEventType.HARVESTED, "HASH-HARVEST-" + batch1.getBatchId(), now.minus(6, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch1, null, TraceabilityEventType.QUALITY_TESTED, "HASH-QUALITY-PASS-" + batch1.getBatchId(), now.minus(5, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch1, null, TraceabilityEventType.AI_SCREENED, "HASH-AI-PURE-" + batch1.getBatchId(), now.minus(5, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch1, null, TraceabilityEventType.PROCESSED, "HASH-PROCESS-FILTRATION-" + batch1.getBatchId(), now.minus(3, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch1, null, TraceabilityEventType.READY_FOR_PACKAGING, "HASH-READY-FOR-PACKAGING-" + batch1.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));

        traceabilityEventRepository.save(new TraceabilityEvent(batch2, null, TraceabilityEventType.HARVESTED, "HASH-HARVEST-" + batch2.getBatchId(), now.minus(3, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch2, null, TraceabilityEventType.QUALITY_TESTED, "HASH-QUALITY-REQUIRES_REVIEW-" + batch2.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch2, null, TraceabilityEventType.AI_SCREENED, "HASH-AI-SUSPECTED_MOISTURE_DILUTION-" + batch2.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));

        traceabilityEventRepository.save(new TraceabilityEvent(batch3, null, TraceabilityEventType.HARVESTED, "HASH-HARVEST-" + batch3.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch3, null, TraceabilityEventType.QUALITY_TESTED, "HASH-QUALITY-PASS-" + batch3.getBatchId(), now.minus(1, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch3, null, TraceabilityEventType.AI_SCREENED, "HASH-AI-PURE-" + batch3.getBatchId(), now.minus(1, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
        traceabilityEventRepository.save(new TraceabilityEvent(batch3, null, TraceabilityEventType.PROCESSED, "HASH-PROCESS-EXTRACTION-" + batch3.getBatchId(), now.minus(10, ChronoUnit.HOURS), "PENDING", BlockchainEnvironment.DEVELOPMENT));

        log.info("PHASE 7 DEMO DATA GENERATED SUCCESSFULLY!");
        log.info("Loaded: 3 Farms, 4 Hives, 3 Honey Batches (Ready for Packaging, Requires Review, Processing), Quality Tests, Processing Records & Off-Chain Traceability Events.");
    }

    private void seedDemoUsers() {
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new User("admin", "admin@honeychain.io", passwordEncoder.encode("Admin@12345"), UserRole.ADMIN));
            log.info("Created DEMO Admin user: admin / Admin@12345");
        }
        if (!userRepository.existsByUsername("beekeeper")) {
            userRepository.save(new User("beekeeper", "beekeeper@honeychain.io", passwordEncoder.encode("Beekeeper@12345"), UserRole.BEEKEEPER));
            log.info("Created DEMO Beekeeper user: beekeeper / Beekeeper@12345");
        }
        if (!userRepository.existsByUsername("inspector")) {
            userRepository.save(new User("inspector", "inspector@honeychain.io", passwordEncoder.encode("Inspector@12345"), UserRole.QUALITY_INSPECTOR));
            log.info("Created DEMO Quality Inspector user: inspector / Inspector@12345");
        }
    }

    private void seedMissingDemoBatches() {
        Hive hive1 = hiveRepository.findByHiveId("HIVE-HIM-001").orElse(null);
        Hive hive2 = hiveRepository.findByHiveId("HIVE-HIM-002").orElse(null);
        Hive hive0 = hiveRepository.findByHiveId("hive-001").orElse(null);

        if (hive1 == null) return;
        Instant now = Instant.now();

        if (honeyBatchRepository.findByBatchId("HC-BATCH-2026-VALLEY-12").isEmpty()) {
            HoneyBatch batch12 = honeyBatchRepository.save(new HoneyBatch(
                    "HC-BATCH-2026-VALLEY-12",
                    hive1,
                    LocalDate.of(2026, 9, 8),
                    380.0,
                    "kg",
                    "High-purity mountain clover bloom harvest.",
                    "Manual Harvest Quantity",
                    HoneyBatchStatus.READY_FOR_PACKAGING
            ));
            qualityTestRepository.save(new QualityTest(batch12, 16.5, 3.88, "Amber Gold", "Passed full laboratory screening.", QualityTestResult.PASS, "Lab Analyst S. Verma - Cert #8895", now.minus(3, ChronoUnit.DAYS)));
            traceabilityEventRepository.save(new TraceabilityEvent(batch12, null, TraceabilityEventType.HARVESTED, "HASH-HARVEST-" + batch12.getBatchId(), now.minus(5, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch12, null, TraceabilityEventType.QUALITY_TESTED, "HASH-QUALITY-PASS-" + batch12.getBatchId(), now.minus(4, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch12, null, TraceabilityEventType.AI_SCREENED, "HASH-AI-PURE-" + batch12.getBatchId(), now.minus(4, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch12, null, TraceabilityEventType.PROCESSED, "HASH-PROCESS-FILTRATION-" + batch12.getBatchId(), now.minus(3, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch12, null, TraceabilityEventType.READY_FOR_PACKAGING, "HASH-READY-FOR-PACKAGING-" + batch12.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            log.info("Seeded demo batch: HC-BATCH-2026-VALLEY-12 (READY_FOR_PACKAGING)");
        }

        if (honeyBatchRepository.findByBatchId("HC-BATCH-2026-VALLEY-13").isEmpty()) {
            HoneyBatch batch13 = honeyBatchRepository.save(new HoneyBatch(
                    "HC-BATCH-2026-VALLEY-13",
                    hive2 != null ? hive2 : hive1,
                    LocalDate.of(2026, 9, 9),
                    290.0,
                    "kg",
                    "Wildflower and forest flora extraction.",
                    "Manual Harvest Quantity",
                    HoneyBatchStatus.READY_FOR_PACKAGING
            ));
            qualityTestRepository.save(new QualityTest(batch13, 17.1, 3.92, "Light Amber", "Passed full laboratory screening.", QualityTestResult.PASS, "Lab Analyst S. Verma - Cert #8896", now.minus(2, ChronoUnit.DAYS)));
            traceabilityEventRepository.save(new TraceabilityEvent(batch13, null, TraceabilityEventType.HARVESTED, "HASH-HARVEST-" + batch13.getBatchId(), now.minus(4, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch13, null, TraceabilityEventType.QUALITY_TESTED, "HASH-QUALITY-PASS-" + batch13.getBatchId(), now.minus(3, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch13, null, TraceabilityEventType.AI_SCREENED, "HASH-AI-PURE-" + batch13.getBatchId(), now.minus(3, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch13, null, TraceabilityEventType.PROCESSED, "HASH-PROCESS-EXTRACTION-" + batch13.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch13, null, TraceabilityEventType.READY_FOR_PACKAGING, "HASH-READY-FOR-PACKAGING-" + batch13.getBatchId(), now.minus(1, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            log.info("Seeded demo batch: HC-BATCH-2026-VALLEY-13 (READY_FOR_PACKAGING)");
        }

        if (honeyBatchRepository.findByBatchId("HC-BATCH-2026-VALLEY-14").isEmpty()) {
            HoneyBatch batch14 = honeyBatchRepository.save(new HoneyBatch(
                    "HC-BATCH-2026-VALLEY-14",
                    hive0 != null ? hive0 : hive1,
                    LocalDate.of(2026, 9, 10),
                    410.0,
                    "kg",
                    "Late season organic acacia honey harvest.",
                    "Manual Harvest Quantity",
                    HoneyBatchStatus.READY_FOR_PACKAGING
            ));
            qualityTestRepository.save(new QualityTest(batch14, 16.0, 4.05, "Golden Blossom", "Passed full laboratory screening.", QualityTestResult.PASS, "Inspector M. Kumar - Cert #9908", now.minus(1, ChronoUnit.DAYS)));
            traceabilityEventRepository.save(new TraceabilityEvent(batch14, null, TraceabilityEventType.HARVESTED, "HASH-HARVEST-" + batch14.getBatchId(), now.minus(3, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch14, null, TraceabilityEventType.QUALITY_TESTED, "HASH-QUALITY-PASS-" + batch14.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch14, null, TraceabilityEventType.AI_SCREENED, "HASH-AI-PURE-" + batch14.getBatchId(), now.minus(2, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch14, null, TraceabilityEventType.PROCESSED, "HASH-PROCESS-PASTEURIZATION-" + batch14.getBatchId(), now.minus(1, ChronoUnit.DAYS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            traceabilityEventRepository.save(new TraceabilityEvent(batch14, null, TraceabilityEventType.READY_FOR_PACKAGING, "HASH-READY-FOR-PACKAGING-" + batch14.getBatchId(), now.minus(12, ChronoUnit.HOURS), "PENDING", BlockchainEnvironment.DEVELOPMENT));
            log.info("Seeded demo batch: HC-BATCH-2026-VALLEY-14 (READY_FOR_PACKAGING)");
        }
    }

    private void cleanupObsoleteDemoPackages() {
        java.util.List<Package> packages = packageRepository.findAll();
        for (Package pkg : packages) {
            if (!"HC-PKG-2026-001".equals(pkg.getPackageId())) {
                log.info("Cleaning up demo package record from database: {}", pkg.getPackageId());
                java.util.List<TraceabilityEvent> events = traceabilityEventRepository.findByPackageEntityPackageId(pkg.getPackageId());
                for (TraceabilityEvent evt : events) {
                    evt.setPackageEntity(null);
                    traceabilityEventRepository.save(evt);
                }
                packageRepository.delete(pkg);
            }
        }
    }
}

