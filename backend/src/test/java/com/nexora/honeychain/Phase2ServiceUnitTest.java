package com.nexora.honeychain;

import com.nexora.honeychain.dto.*;
import com.nexora.honeychain.exception.ResourceAlreadyExistsException;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.model.*;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.model.enums.HiveStatus;
import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import com.nexora.honeychain.model.enums.QualityTestResult;
import com.nexora.honeychain.repository.*;
import com.nexora.honeychain.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Phase2ServiceUnitTest {

    @Mock
    private FarmRepository farmRepository;
    @Mock
    private HiveRepository hiveRepository;
    @Mock
    private SensorReadingRepository sensorReadingRepository;
    @Mock
    private AIAlertRepository aiAlertRepository;
    @Mock
    private HoneyBatchRepository honeyBatchRepository;
    @Mock
    private QualityTestRepository qualityTestRepository;
    @Mock
    private ProcessingRecordRepository processingRecordRepository;
    @Mock
    private PackageRepository packageRepository;
    @Mock
    private TraceabilityEventRepository traceabilityEventRepository;
    @InjectMocks
    private FarmService farmService;
    @InjectMocks
    private HiveService hiveService;
    @InjectMocks
    private SensorReadingService sensorReadingService;
    @InjectMocks
    private HoneyBatchService honeyBatchService;
    private QualityTestService qualityTestService;
    @InjectMocks
    private ProcessingRecordService processingRecordService;
    @InjectMocks
    private PackageService packageService;
    @InjectMocks
    private TraceabilityService traceabilityService;
    @InjectMocks
    private VerificationService verificationService;

    private Farm sampleFarm;
    private Hive sampleHive;
    private HoneyBatch sampleBatch;
    private Package samplePackage;

    @BeforeEach
    void setUp() {
        qualityTestService = new QualityTestService(qualityTestRepository, honeyBatchRepository, traceabilityEventRepository, new com.nexora.honeychain.ai.HoneyQualityEvaluator());

        sampleFarm = new Farm("FARM-001", "Green Valley Apiary", "Demo Beekeeper", "Demo Location", 20.5937, 78.9629);
        sampleFarm.setId("farm-uuid-1");

        sampleHive = new Hive("HIVE-001", sampleFarm, "Hive 001", "North Field", 20.5937, 78.9629, HiveStatus.ACTIVE);
        sampleHive.setId("hive-uuid-1");

        sampleBatch = new HoneyBatch("BATCH-001", sampleHive, LocalDate.of(2026, 9, 7), 25.5, "KG", HoneyBatchStatus.HARVESTED);
        sampleBatch.setId("batch-uuid-1");

        samplePackage = new Package("PKG-001", sampleBatch, "https://honeychain.io/verify/PKG-001", com.nexora.honeychain.model.enums.PackageStatus.PACKAGED, Instant.now());
        samplePackage.setId("pkg-uuid-1");
    }

    // --- FARM TESTS ---
    @Test
    @DisplayName("Farm Creation - Success")
    void testCreateFarmSuccess() {
        CreateFarmRequest req = new CreateFarmRequest("FARM-001", "Green Valley", "Owner", "Loc", 20.0, 78.0);
        when(farmRepository.findByFarmId("FARM-001")).thenReturn(Optional.empty());
        when(farmRepository.save(any(Farm.class))).thenReturn(sampleFarm);

        FarmResponse resp = farmService.createFarm(req);
        assertNotNull(resp);
        assertEquals("FARM-001", resp.getFarmId());
    }

    @Test
    @DisplayName("Farm Creation - Duplicate Farm ID Throws Exception")
    void testCreateFarmDuplicateId() {
        CreateFarmRequest req = new CreateFarmRequest("FARM-001", "Green Valley", "Owner", "Loc", 20.0, 78.0);
        when(farmRepository.findByFarmId("FARM-001")).thenReturn(Optional.of(sampleFarm));

        assertThrows(ResourceAlreadyExistsException.class, () -> farmService.createFarm(req));
    }

    @Test
    @DisplayName("Farm Retrieval - Success & Not Found")
    void testGetFarm() {
        when(farmRepository.findByFarmId("FARM-001")).thenReturn(Optional.of(sampleFarm));
        FarmResponse resp = farmService.getFarmByFarmId("FARM-001");
        assertEquals("FARM-001", resp.getFarmId());

        when(farmRepository.findByFarmId("UNKNOWN")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> farmService.getFarmByFarmId("UNKNOWN"));
    }

    // --- HIVE TESTS ---
    @Test
    @DisplayName("Hive Creation - Success & Unknown Farm")
    void testCreateHive() {
        CreateHiveRequest req = new CreateHiveRequest("HIVE-001", "FARM-001", "Hive 1", "Loc", 20.0, 78.0, HiveStatus.ACTIVE);
        when(farmRepository.findByFarmId("FARM-001")).thenReturn(Optional.of(sampleFarm));
        when(hiveRepository.findByHiveId("HIVE-001")).thenReturn(Optional.empty());
        when(hiveRepository.save(any(Hive.class))).thenReturn(sampleHive);

        HiveResponse resp = hiveService.createHive(req);
        assertEquals("HIVE-001", resp.getHiveId());

        // Unknown Farm
        when(farmRepository.findByFarmId("UNKNOWN-FARM")).thenReturn(Optional.empty());
        CreateHiveRequest badReq = new CreateHiveRequest("HIVE-002", "UNKNOWN-FARM", "Hive 2", "Loc", 20.0, 78.0, HiveStatus.ACTIVE);
        assertThrows(ResourceNotFoundException.class, () -> hiveService.createHive(badReq));
    }

    // --- SENSOR TESTS ---
    @Test
    @DisplayName("Sensor Reading - Store and Handles Null Sensor Values")
    void testSensorReadingCreationAndNullSupport() {
        CreateSensorReadingRequest req = new CreateSensorReadingRequest("HIVE-001", null, 61.2, 2047.0, 43.5, 20.59, 78.96, 1700000000L);
        when(hiveRepository.findByHiveId("HIVE-001")).thenReturn(Optional.of(sampleHive));

        SensorReading readingEntity = new SensorReading(sampleHive, null, 61.2, 2047.0, 43.5, Instant.ofEpochSecond(1700000000L));
        when(sensorReadingRepository.save(any(SensorReading.class))).thenReturn(readingEntity);

        SensorReadingResponse resp = sensorReadingService.recordSensorReading(req);
        assertNotNull(resp);
        assertNull(resp.getTemperature());
        assertEquals(61.2, resp.getHumidity());
    }

    @Test
    @DisplayName("Sensor Reading - Unknown Hive Throws Exception")
    void testSensorReadingUnknownHive() {
        CreateSensorReadingRequest req = new CreateSensorReadingRequest("UNKNOWN-HIVE", 27.4, 60.0, 100.0, 40.0, 20.0, 78.0, 1700000000L);
        when(hiveRepository.findByHiveId("UNKNOWN-HIVE")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> sensorReadingService.recordSensorReading(req));
    }

    // --- BATCH & RECALL TESTS ---
    @Test
    @DisplayName("Honey Batch Creation & Recall")
    void testBatchWorkflow() {
        CreateHoneyBatchRequest req = new CreateHoneyBatchRequest("BATCH-001", "HIVE-001", LocalDate.now(), 25.5, "KG", HoneyBatchStatus.HARVESTED);
        when(hiveRepository.findByHiveId("HIVE-001")).thenReturn(Optional.of(sampleHive));
        when(honeyBatchRepository.findByBatchId("BATCH-001")).thenReturn(Optional.empty());
        when(honeyBatchRepository.save(any(HoneyBatch.class))).thenReturn(sampleBatch);

        HoneyBatchResponse resp = honeyBatchService.createBatch(req);
        assertEquals("BATCH-001", resp.getBatchId());

        // Recall test
        when(honeyBatchRepository.findByBatchId("BATCH-001")).thenReturn(Optional.of(sampleBatch));
        when(honeyBatchRepository.save(any(HoneyBatch.class))).thenReturn(sampleBatch);
        HoneyBatchResponse recalledResp = honeyBatchService.recallBatch("BATCH-001");
        assertNotNull(recalledResp);
    }

    // --- QUALITY TEST & PROCESSING & PACKAGE TESTS ---
    @Test
    @DisplayName("Quality Test, Processing, Package creation")
    void testQualityProcessingPackage() {
        when(honeyBatchRepository.findByBatchId("BATCH-001")).thenReturn(Optional.of(sampleBatch));

        // Quality Test
        CreateQualityTestRequest qReq = new CreateQualityTestRequest(17.5, 4.2, "Amber", QualityTestResult.PASS, "Inspector");
        QualityTest qTest = new QualityTest(sampleBatch, 17.5, 4.2, "Amber", QualityTestResult.PASS, "Inspector", Instant.now());
        when(qualityTestRepository.save(any(QualityTest.class))).thenReturn(qTest);
        QualityTestResponse qResp = qualityTestService.addQualityTest("BATCH-001", qReq);
        assertEquals(QualityTestResult.PASS, qResp.getResult());

        // Processing Record
        CreateProcessingRecordRequest pReq = new CreateProcessingRecordRequest("FILTERING", "Filtered", "Operator");
        ProcessingRecord pRec = new ProcessingRecord(sampleBatch, "FILTERING", "Filtered", Instant.now(), "Operator");
        when(processingRecordRepository.save(any(ProcessingRecord.class))).thenReturn(pRec);
        ProcessingRecordResponse pResp = processingRecordService.addProcessingRecord("BATCH-001", pReq);
        assertEquals("FILTERING", pResp.getProcessType());

        // Package Creation
        CreatePackageRequest pkgReq = new CreatePackageRequest("PKG-001", "BATCH-001", "2026-09-07", com.nexora.honeychain.model.enums.PackageStatus.PACKAGED);
        when(packageRepository.findByPackageId("PKG-001")).thenReturn(Optional.empty());
        when(packageRepository.save(any(Package.class))).thenReturn(samplePackage);
        PackageResponse pkgResp = packageService.createPackage(pkgReq);
        assertEquals("PKG-001", pkgResp.getPackageId());
    }

    // --- CUSTOMER VERIFICATION TEST ---
    @Test
    @DisplayName("Customer Verification Aggregation")
    void testCustomerVerification() {
        when(packageRepository.findByPackageId("PKG-001")).thenReturn(Optional.of(samplePackage));
        when(qualityTestRepository.findByBatchBatchId("BATCH-001")).thenReturn(List.of());
        when(processingRecordRepository.findByBatchBatchId("BATCH-001")).thenReturn(List.of());
        when(traceabilityEventRepository.findByPackageEntityPackageIdOrderByTimestampAsc("PKG-001")).thenReturn(List.of());
        when(traceabilityEventRepository.findByBatchBatchIdOrderByTimestampAsc("BATCH-001")).thenReturn(List.of());

        CustomerVerificationResponse verifyResp = verificationService.verifyPackage("PKG-001");
        assertNotNull(verifyResp);
        assertEquals("PENDING", verifyResp.getBlockchainVerificationStatus());
        assertEquals("PKG-001", verifyResp.getPackageInfo().getPackageId());
        assertEquals("BATCH-001", verifyResp.getBatch().getBatchId());
        assertEquals("HIVE-001", verifyResp.getHive().getHiveId());
        assertEquals("FARM-001", verifyResp.getFarm().getFarmId());
    }
}
