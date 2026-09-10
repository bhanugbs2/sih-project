package com.nexora.honeychain.mapper;

import com.nexora.honeychain.dto.*;
import com.nexora.honeychain.model.*;
import com.nexora.honeychain.model.Package;

public class DtoMapper {

    public static FarmResponse toFarmResponse(Farm farm) {
        if (farm == null) return null;
        return new FarmResponse(
                farm.getId(),
                farm.getFarmId(),
                farm.getName(),
                farm.getOwnerName(),
                farm.getLocation(),
                farm.getLatitude(),
                farm.getLongitude(),
                farm.getCreatedAt(),
                farm.getUpdatedAt()
        );
    }

    public static Farm toFarmEntity(CreateFarmRequest request) {
        if (request == null) return null;
        return new Farm(
                request.getFarmId(),
                request.getName(),
                request.getOwnerName(),
                request.getLocation(),
                request.getLatitude(),
                request.getLongitude()
        );
    }

    public static HiveResponse toHiveResponse(Hive hive) {
        if (hive == null) return null;
        return new HiveResponse(
                hive.getId(),
                hive.getHiveId(),
                hive.getFarm() != null ? hive.getFarm().getFarmId() : null,
                hive.getName(),
                hive.getLocation(),
                hive.getLatitude(),
                hive.getLongitude(),
                hive.getStatus(),
                hive.getCreatedAt(),
                hive.getUpdatedAt()
        );
    }

    public static Hive toHiveEntity(CreateHiveRequest request, Farm farm) {
        if (request == null) return null;
        return new Hive(
                request.getHiveId(),
                farm,
                request.getName(),
                request.getLocation(),
                request.getLatitude(),
                request.getLongitude(),
                request.getStatus()
        );
    }

    public static SensorReadingResponse toSensorReadingResponse(SensorReading reading) {
        if (reading == null) return null;
        Long epochSecond = reading.getTimestamp() != null ? reading.getTimestamp().getEpochSecond() : null;
        return new SensorReadingResponse(
                reading.getId(),
                reading.getHive() != null ? reading.getHive().getHiveId() : null,
                reading.getTemperature(),
                reading.getHumidity(),
                reading.getWeight(),
                reading.getSoundLevel(),
                reading.getLatitude(),
                reading.getLongitude(),
                epochSecond
        );
    }

    public static SensorReading toSensorReadingEntity(CreateSensorReadingRequest request, Hive hive) {
        if (request == null) return null;
        SensorReading reading = new SensorReading(
                hive,
                request.getTemperature(),
                request.getHumidity(),
                request.getWeight(),
                request.getSoundLevel(),
                request.getTimestampAsInstant()
        );
        reading.setLatitude(request.getLatitude());
        reading.setLongitude(request.getLongitude());
        return reading;
    }

    public static AIAlertResponse toAIAlertResponse(AIAlert alert) {
        if (alert == null) return null;
        return new AIAlertResponse(
                alert.getId(),
                alert.getHive() != null ? alert.getHive().getHiveId() : null,
                alert.getRiskScore(),
                alert.getStatus(),
                alert.getMessage(),
                alert.getFactors(),
                alert.getTimestamp(),
                alert.getCreatedAt(),
                alert.isRead(),
                alert.getReadAt(),
                alert.isAcknowledged(),
                alert.getAcknowledgedAt(),
                alert.getAcknowledgedBy(),
                alert.getAlertType(),
                alert.getModelVersion(),
                alert.getBatchId()
        );
    }

    public static HoneyBatchResponse toHoneyBatchResponse(HoneyBatch batch) {
        if (batch == null) return null;
        String farmId = (batch.getHive() != null && batch.getHive().getFarm() != null) ? batch.getHive().getFarm().getFarmId() : null;
        String farmName = (batch.getHive() != null && batch.getHive().getFarm() != null) ? batch.getHive().getFarm().getName() : null;
        return new HoneyBatchResponse(
                batch.getId(),
                batch.getBatchId(),
                batch.getHive() != null ? batch.getHive().getHiveId() : null,
                farmId,
                farmName,
                batch.getHarvestDate(),
                batch.getQuantity(),
                batch.getUnit(),
                batch.getHarvestNotes(),
                batch.getQuantitySource() != null ? batch.getQuantitySource() : "Manual Harvest Quantity",
                batch.getStatus(),
                batch.getCreatedAt(),
                batch.getUpdatedAt()
        );
    }

    public static HoneyBatch toHoneyBatchEntity(CreateHoneyBatchRequest request, Hive hive) {
        if (request == null) return null;
        return new HoneyBatch(
                request.getBatchId(),
                hive,
                request.getHarvestDate(),
                request.getQuantity(),
                request.getUnit(),
                request.getHarvestNotes(),
                request.getQuantitySource() != null ? request.getQuantitySource() : "Manual Harvest Quantity",
                request.getStatus()
        );
    }

    public static QualityTestResponse toQualityTestResponse(QualityTest test) {
        if (test == null) return null;
        return new QualityTestResponse(
                test.getId(),
                test.getBatch() != null ? test.getBatch().getBatchId() : null,
                test.getMoisture(),
                test.getPH(),
                test.getColor(),
                test.getNotes(),
                test.getResult(),
                test.getVerifiedBy(),
                test.getTimestamp(),
                test.getTestedAt(),
                test.getCreatedAt()
        );
    }

    public static QualityTest toQualityTestEntity(CreateQualityTestRequest request, HoneyBatch batch) {
        if (request == null) return null;
        return new QualityTest(
                batch,
                request.getMoisture(),
                request.getPH(),
                request.getColor(),
                request.getNotes(),
                request.getResult(),
                request.getVerifiedBy(),
                java.time.Instant.now()
        );
    }

    public static ProcessingRecordResponse toProcessingRecordResponse(ProcessingRecord record) {
        if (record == null) return null;
        return new ProcessingRecordResponse(
                record.getId(),
                record.getBatch() != null ? record.getBatch().getBatchId() : null,
                record.getOperation(),
                record.getOperator(),
                record.getDescription(),
                record.getStartedAt(),
                record.getCompletedAt(),
                record.getProcessingTemperature(),
                record.getTempSource(),
                record.getTimestamp(),
                record.getCreatedAt()
        );
    }

    public static ProcessingRecord toProcessingRecordEntity(CreateProcessingRecordRequest request, HoneyBatch batch) {
        if (request == null) return null;
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant start = request.getStartedAt() != null ? request.getStartedAt() : now;
        java.time.Instant end = request.getCompletedAt() != null ? request.getCompletedAt() : now;
        return new ProcessingRecord(
                batch,
                request.getOperation(),
                request.getOperator(),
                start,
                end,
                request.getProcessingTemperature(),
                request.getDescription()
        );
    }

    public static PackageResponse toPackageResponse(Package pkg) {
        if (pkg == null) return null;
        return new PackageResponse(
                pkg.getId(),
                pkg.getPackageId(),
                pkg.getBatch() != null ? pkg.getBatch().getBatchId() : null,
                pkg.getQrUrl(),
                pkg.getStatus(),
                pkg.getPackagingDate(),
                pkg.getCreatedAt(),
                pkg.getUpdatedAt()
        );
    }

    public static Package toPackageEntity(CreatePackageRequest request, HoneyBatch batch) {
        if (request == null) return null;
        return new Package(
                request.getPackageId(),
                batch,
                "https://honeychain.io/verify/" + request.getPackageId(),
                request.getStatus(),
                request.getPackagingDateAsInstant()
        );
    }

    public static TraceabilityEventResponse toTraceabilityEventResponse(TraceabilityEvent event) {
        if (event == null) return null;
        TraceabilityEventResponse res = new TraceabilityEventResponse(
                event.getId(),
                event.getBatch() != null ? event.getBatch().getBatchId() : null,
                event.getPackageEntity() != null ? event.getPackageEntity().getPackageId() : null,
                event.getEventType(),
                event.getEventDataHash(),
                event.getTimestamp(),
                event.getBlockchainReference(),
                event.getEnvironment(),
                event.getCreatedAt()
        );
        res.setBlockchainStatus(event.getBlockchainStatus());
        res.setBlockchainTransactionHash(event.getBlockchainTransactionHash());
        res.setBlockchainNetwork(event.getBlockchainNetwork());
        res.setBlockchainTimestamp(event.getBlockchainTimestamp());
        res.setBlockchainDataHash(event.getBlockchainDataHash());
        return res;
    }
}
