# HoneyChain Phase 1 Technical Analysis & Data Architecture Plan 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  
> **Phase:** 1 (Database & Backend Data Foundation)  

---

## 1. Inspection of Existing Backend Implementation

A comprehensive review of the pre-existing backend codebase in `/backend` reveals the following:

### Found Components:
- **Build System (`pom.xml`)**: Spring Boot 3.3.3, Java 21 release property, Spring Data JPA, Spring Web, Spring Validation, PostgreSQL driver, Flyway migrations (`flyway-core`, `flyway-database-postgresql`), Actuator.
- **Application Configuration**:
  - `application.yml`: Actuator endpoints exposed, application metadata.
  - `application-dev.yml`: Environment variable placeholders for PostgreSQL host (`DB_HOST`), port (`DB_PORT`), database name (`DB_NAME`), username (`DB_USERNAME`), password (`DB_PASSWORD`), and `hibernate.ddl-auto: validate`.
- **Flyway Migration (`V1__init_schema.sql`)**: Basic initial table schemas for `users`, `hives`, `telemetry_logs`, `honey_batches`, `quality_tests`, `processing_records`, `package_tracking`, `blockchain_transactions`.
- **Java Entities**: Initial `Hive.java` and `HoneyBatch.java` classes.
- **Repositories**: Initial `HiveRepository.java` (`findByHiveCode`) and `HoneyBatchRepository.java` (`findByBatchCode`).

---

## 2. Missing Implementation & Problems Discovered

| Area | Discovered Gap / Issue | Impact & Phase 1 Correction Plan |
|---|---|---|
| **Multi-Farm Hierarchy** | Missing `Farm` entity and table. Hives currently float without parent farm association. | Introduce `Farm` entity (`farmId` unique, `name`, `ownerName`, `location`, `latitude`, `longitude`) and `@ManyToOne` relationship in `Hive`. |
| **Domain Enums** | Status fields in entities currently use raw string literals rather than typed Java enums. | Implement Java enums for `HiveStatus`, `AIAlertStatus`, `HoneyBatchStatus`, `QualityTestResult`, `PackageStatus`, `TraceabilityEventType`, and `BlockchainEnvironment`. |
| **Sensor Telemetry Model** | `telemetry_logs` uses flat structure without explicit composite indexing or null sensor failure validation rules. | Create `SensorReading` entity supporting nullable temperature/humidity for sensor failure simulation, and add composite index `(hive_id, timestamp)`. |
| **AI Alerts & Data Foundation** | Missing `AIAlert` entity and table for decision-support risk scoring. | Add `AIAlert` entity (`riskScore` 0-100, `status` enum, `message`, `factors`, `timestamp`). |
| **Traceability Events** | Missing `TraceabilityEvent` entity for audit logging of lifecycle milestones. | Add `TraceabilityEvent` entity referencing `HoneyBatch` and optional `Package`. |
| **Package Entity** | `Package` entity missing for jar serialization. | Add `Package` entity (`packageId` unique, `qrUrl`, `status`, `packagingDate`). |
| **Database Migrations** | `V1__init_schema.sql` lacks constraints for multi-farm hierarchy and composite sensor indexes. | Create `V2__complete_honeychain_schema.sql` to add foreign keys, unique constraints, check constraints, and composite indexes. |
| **Local Dev Infrastructure** | Missing `docker-compose.yml` for PostgreSQL service. | Create root `docker-compose.yml` with PostgreSQL 16 container, named volume `postgres_data`, and health check. |
| **Seed Data Mechanism** | Missing dev seed data runner. | Create `DatabaseSeeder.java` generating synthetic demo data for 3 farms, 3 hives, 24 sensor readings, 2 batches, quality tests, processing records, packages, and traceability events. |

---

## 3. Required Entity Relationship Diagram

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

---

## 4. Final Phase 1 Implementation Plan

1. **Add H2 Test Dependency to `pom.xml`**: Ensure repository unit tests execute cleanly in isolated in-memory H2 database during Maven builds.
2. **Create Domain Enums**: `HiveStatus`, `AIAlertStatus`, `HoneyBatchStatus`, `QualityTestResult`, `PackageStatus`, `TraceabilityEventType`, `BlockchainEnvironment`.
3. **Implement Full JPA Entities**: `Farm`, `Hive`, `SensorReading`, `AIAlert`, `HoneyBatch`, `QualityTest`, `ProcessingRecord`, `Package`, `TraceabilityEvent`.
4. **Create Flyway Migration (`V2__complete_honeychain_schema.sql`)**: Complete DDL migration with constraints, foreign keys, and indexes.
5. **Create Spring Data JPA Repositories**: 9 repositories with custom query methods.
6. **Create Local Infrastructure (`docker-compose.yml`)**: PostgreSQL 16 setup.
7. **Create Seed Data Runner (`DatabaseSeeder.java`)**: Populates realistic DEMO data.
8. **Create Database & Repository Integration Tests**: Validates entity persistence, relationships, unique constraints, and nullable sensor handling.
