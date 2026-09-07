# HoneyChain Phase 1 Completion Report 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  
> **Phase:** 1 (Database & Backend Data Foundation)  

---

## 1. Code & Environment Inspection Summary

The existing backend codebase was thoroughly inspected before implementation:
- **Found Components**: `pom.xml`, `application.yml`, `application-dev.yml`, `V1__init_schema.sql`, `HoneyChainApplication.java`, basic `Hive` and `HoneyBatch` skeletons.
- **Identified Gaps**: Missing multi-farm hierarchy, missing typed domain enums, missing `SensorReading` entity supporting null sensor failure handling, missing `AIAlert`, `Package`, and `TraceabilityEvent` entities, missing composite database indexes, missing `docker-compose.yml`, missing demo data seeder, missing database integration tests.

---

## 2. Changes Made & Files Created / Modified

### Root Monorepo
- **`docker-compose.yml`** *(NEW)*: Local PostgreSQL 16 container definition with persistent named volume `postgres_data`, environment variables (`DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`), and healthcheck.

### Backend Configurations & Build
- **`backend/pom.xml`** *(MODIFIED)*: Added H2 database test dependency (`com.h2database:h2` with `test` scope) to enable automated in-memory repository tests during Maven builds.
- **`backend/src/main/resources/application-test.yml`** *(NEW)*: Dedicated test profile configuration for in-memory H2 database.

### Domain Enums (`com.nexora.honeychain.model.enums`)
- **`HiveStatus.java`** *(NEW)*: `ACTIVE`, `INACTIVE`, `MAINTENANCE`
- **`AIAlertStatus.java`** *(NEW)*: `NORMAL`, `WARNING`, `CRITICAL`
- **`HoneyBatchStatus.java`** *(NEW)*: `HARVESTED`, `QUALITY_TESTING`, `QUALITY_VERIFIED`, `PROCESSING`, `PACKAGED`, `COMPLETED`, `RECALLED`
- **`QualityTestResult.java`** *(NEW)*: `PENDING`, `PASS`, `FAIL`
- **`PackageStatus.java`** *(NEW)*: `CREATED`, `PACKAGED`, `VERIFIED`, `RECALLED`
- **`TraceabilityEventType.java`** *(NEW)*: `HARVESTED`, `QUALITY_VERIFIED`, `PROCESSED`, `PACKAGED`, `VERIFIED`
- **`BlockchainEnvironment.java`** *(NEW)*: `DEVELOPMENT`, `TEST`, `PRODUCTION`

### JPA Domain Entities (`com.nexora.honeychain.model`)
- **`Farm.java`** *(NEW)*: `id`, `farmId` (unique), `name`, `ownerName`, `location`, `latitude`, `longitude`, timestamps.
- **`Hive.java`** *(UPDATED)*: Added `@ManyToOne` relationship to `Farm`, `hiveId` (unique), `name`, `status` (`HiveStatus`), timestamps.
- **`SensorReading.java`** *(NEW)*: `id`, `hive` (`Hive`), `temperature` (nullable on failure), `humidity` (0..100), `weight` (>=0), `soundLevel` (>=0), `latitude`, `longitude`, `timestamp` (required).
- **`AIAlert.java`** *(NEW)*: `id`, `hive` (`Hive`), `riskScore` (0..100), `status` (`AIAlertStatus`), `message`, `factors`, `timestamp`.
- **`HoneyBatch.java`** *(UPDATED)*: Added `@ManyToOne` relationship to `Hive`, `batchId` (unique), `harvestDate`, `quantity` (>0), `unit`, `status` (`HoneyBatchStatus`), timestamps.
- **`QualityTest.java`** *(NEW)*: `id`, `batch` (`HoneyBatch`), `moisture`, `pH`, `color`, `result` (`QualityTestResult`), `verifiedBy`, `timestamp`.
- **`ProcessingRecord.java`** *(NEW)*: `id`, `batch` (`HoneyBatch`), `processType`, `description`, `timestamp`, `verifiedBy`.
- **`Package.java`** *(NEW)*: `id`, `packageId` (unique), `batch` (`HoneyBatch`), `qrUrl` (nullable), `status` (`PackageStatus`), `packagingDate`, timestamps.
- **`TraceabilityEvent.java`** *(NEW)*: `id`, `batch` (`HoneyBatch`), `packageEntity` (`Package` nullable), `eventType` (`TraceabilityEventType`), `eventDataHash`, `timestamp`, `blockchainReference`, `environment` (`BlockchainEnvironment`).

### Database Migrations (`com/nexora/honeychain/resources/db/migration`)
- **`V2__complete_honeychain_schema.sql`** *(NEW)*: Comprehensive DDL migration creating `farms`, `hives`, `sensor_readings`, `ai_alerts`, `honey_batches`, `quality_tests`, `processing_records`, `packages`, `traceability_events`, composite index `sensor_readings(hive_id, timestamp)`, foreign key constraints, and check constraints.

### Spring Data JPA Repositories (`com.nexora.honeychain.repository`)
- **`FarmRepository.java`** *(NEW)*: `findByFarmId(String farmId)`
- **`HiveRepository.java`** *(UPDATED)*: `findByHiveId(String hiveId)`, `findByFarmFarmId(String farmId)`
- **`SensorReadingRepository.java`** *(NEW)*: `findByHiveHiveIdOrderByTimestampDesc(String hiveId)`
- **`AIAlertRepository.java`** *(NEW)*: `findByHiveHiveIdOrderByTimestampDesc(String hiveId)`
- **`HoneyBatchRepository.java`** *(UPDATED)*: `findByBatchId(String batchId)`, `findByHiveHiveId(String hiveId)`
- **`QualityTestRepository.java`** *(NEW)*: `findByBatchBatchId(String batchId)`
- **`ProcessingRecordRepository.java`** *(NEW)*: `findByBatchBatchId(String batchId)`
- **`PackageRepository.java`** *(NEW)*: `findByPackageId(String packageId)`, `findByBatchBatchId(String batchId)`
- **`TraceabilityEventRepository.java`** *(NEW)*: `findByBatchBatchId(String batchId)`, `findByPackageEntityPackageId(String packageId)`

### Demo Data Component
- **`DatabaseSeeder.java`** *(NEW)*: Automated startup runner populating synthetic demo data (3 farms, 3 hives, 24 sensor readings with null failure simulation, 2 batches, quality tests, processing logs, packages, traceability events, AI alerts).

### Integration Tests
- **`DataFoundationIntegrationTest.java`** *(NEW)*: Automated Spring Boot integration test suite verifying entity persistence, relationship mappings, unique constraints, null sensor handling, and repository query methods.

---

## 3. Database Architecture & Relationships

```text
Farm (1) ───────────< (Many) Hive
                        │
                        ├───────────< (Many) SensorReading
                        ├───────────< (Many) AIAlert
                        └───────────< (Many) HoneyBatch (1) ───┬───< (Many) QualityTest
                                                               ├───< (Many) ProcessingRecord
                                                               ├───< (Many) Package (1) ───< (Many) TraceabilityEvent
                                                               └───────────────────────────< (Many) TraceabilityEvent
```

### Table Definitions & Primary Indexes:
1. `farms`: Primary Key `id`, UNIQUE `farm_id`
2. `hives`: Primary Key `id`, UNIQUE `hive_id`, Foreign Key `farm_id` -> `farms(id)`
3. `sensor_readings`: Primary Key `id`, Foreign Key `hive_id` -> `hives(id)`, **Composite Index `(hive_id, timestamp DESC)`**, CHECK constraints (`humidity BETWEEN 0 AND 100`, `weight >= 0`, `sound_level >= 0`)
4. `ai_alerts`: Primary Key `id`, Foreign Key `hive_id` -> `hives(id)`, Index `(hive_id, timestamp DESC)`, CHECK constraint (`risk_score BETWEEN 0 AND 100`)
5. `honey_batches`: Primary Key `id`, UNIQUE `batch_id`, Foreign Key `hive_id` -> `hives(id)`, Index `(hive_id)`
6. `quality_tests`: Primary Key `id`, Foreign Key `batch_id` -> `honey_batches(id)`
7. `processing_records`: Primary Key `id`, Foreign Key `batch_id` -> `honey_batches(id)`
8. `packages`: Primary Key `id`, UNIQUE `package_id`, Foreign Key `batch_id` -> `honey_batches(id)`, Index `(batch_id)`
9. `traceability_events`: Primary Key `id`, Foreign Key `batch_id` -> `honey_batches(id)`, Foreign Key `package_id` -> `packages(id)`, Indexes `(batch_id)`, `(package_id)`

---

## 4. Demo Data Summary

The `DatabaseSeeder.java` component populates synthetic DEMO data:
- **3 Farms**: `FARM-HIM-01` (Himalayan Organic Apiary), `FARM-ALP-02` (Alpine Meadows Apiary), `FARM-VAL-03` (Valley Blossom Apiary).
- **3 Hives**: `HIVE-HIM-001`, `HIVE-HIM-002`, `HIVE-VAL-003`.
- **24 SensorReadings**: Includes 20 normal telemetry samples and 4 sensor failure samples (simulating null temperature, null humidity, null weight, and null sound level).
- **2 AI Alerts**: 1 Optimal alert, 1 Warning alert (*"Abnormal hive pattern detected. Beekeeper inspection recommended."*).
- **2 Honey Batches**: `HC-BATCH-2026-VALLEY-09` (450kg), `HC-BATCH-2026-VALLEY-10` (320kg).
- **2 Quality Tests**: Passed lab certificates (Purity 99.4%, Moisture 16.2%, pH 3.85).
- **1 Processing Record**: Cold Extraction & Micro-Filtration at 36.5°C max.
- **2 Packages**: `HC-PKG-2026-001`, `HC-PKG-2026-002`.
- **2 Traceability Events**: `HARVESTED` and `PACKAGED` lifecycle milestones.

---

## 5. Tests Executed & Results

```powershell
.\mvnw.cmd test
```

### Test Suite Execution Summary:
```text
[INFO] Running com.nexora.honeychain.DataFoundationIntegrationTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 24.82 s
[INFO] Running com.nexora.honeychain.HoneyChainApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.004 s
[INFO] 
[INFO] Results:
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] Total time: 33.747 s
```

---

## 6. Problems Encountered & Fixed

| # | Problem Encountered | Root Cause | Resolution |
|---|---|---|---|
| 1 | `LazyInitializationException` in `testFarmAndHivePersistence` | Accessing lazy-loaded `Hive.getFarm().getFarmId()` proxy outside transaction context during JUnit assertions | Added `@Transactional` annotation to `DataFoundationIntegrationTest.java` to keep JPA session open during assertions. |
| 2 | Automated tests required live PostgreSQL instance | Test execution attempted to connect to PostgreSQL at `localhost:5432` | Added H2 database test dependency to `pom.xml` and created `application-test.yml` for isolated in-memory test execution. |

---

## 7. Remaining Work for Phase 2

- **Phase 2 Objectives**: ESP32 C++/Arduino telemetry firmware integration, simulated telemetry daemon, REST API controller endpoints (`/api/v1/hives`, `/api/v1/batches`, `/api/v1/telemetry`), DTO mapping layer, and service handlers.
