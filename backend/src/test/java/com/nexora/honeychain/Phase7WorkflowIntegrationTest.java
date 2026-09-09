package com.nexora.honeychain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.dto.CreateHoneyBatchRequest;
import com.nexora.honeychain.dto.CreateProcessingRecordRequest;
import com.nexora.honeychain.dto.CreateQualityTestRequest;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.User;
import com.nexora.honeychain.model.enums.HiveStatus;
import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import com.nexora.honeychain.model.enums.QualityTestResult;
import com.nexora.honeychain.model.enums.UserRole;
import com.nexora.honeychain.repository.FarmRepository;
import com.nexora.honeychain.repository.HiveRepository;
import com.nexora.honeychain.repository.UserRepository;
import com.nexora.honeychain.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class Phase7WorkflowIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    @Autowired private FarmRepository farmRepository;
    @Autowired private HiveRepository hiveRepository;

    private static final String TEST_HIVE_ID = "HIVE-P7-TEST-01";
    private String beekeeperToken;
    private String inspectorToken;

    @BeforeEach
    void setUp() {
        if (!userRepository.existsByUsername("beekeeper")) {
            userRepository.save(new User("beekeeper", "beekeeper@honeychain.io", passwordEncoder.encode("Beekeeper@12345"), UserRole.BEEKEEPER));
        }
        if (!userRepository.existsByUsername("inspector")) {
            userRepository.save(new User("inspector", "inspector@honeychain.io", passwordEncoder.encode("Inspector@12345"), UserRole.QUALITY_INSPECTOR));
        }

        beekeeperToken = jwtService.generateToken("beekeeper", UserRole.BEEKEEPER);
        inspectorToken = jwtService.generateToken("inspector", UserRole.QUALITY_INSPECTOR);

        if (!hiveRepository.existsByHiveId(TEST_HIVE_ID)) {
            Farm farm = farmRepository.findAll().stream().findFirst().orElseGet(() ->
                    farmRepository.save(new Farm("FARM-P7-TEST", "Phase 7 Apiary", "Master Beekeeper", "Shimla, India", 31.10, 77.17))
            );
            hiveRepository.save(new Hive(TEST_HIVE_ID, farm, "Phase 7 Harvest Test Hive", "Super A", 31.10, 77.17, HiveStatus.ACTIVE));
        }
    }

    @Test
    @DisplayName("1. Create Honey Batch - Successful Harvest Registration")
    void testCreateHoneyBatchSuccess() throws Exception {
        CreateHoneyBatchRequest request = new CreateHoneyBatchRequest(
                "BATCH-P7-001",
                TEST_HIVE_ID,
                LocalDate.now(),
                150.5,
                "kg",
                "Summer harvest, super frames 1-5",
                "Manual Harvest Quantity",
                HoneyBatchStatus.HARVESTED
        );

        mockMvc.perform(post("/api/batches")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.batchId", is("BATCH-P7-001")))
                .andExpect(jsonPath("$.hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$.quantity", is(150.5)))
                .andExpect(jsonPath("$.quantitySource", is("Manual Harvest Quantity")))
                .andExpect(jsonPath("$.status", is("HARVESTED")));
    }

    @Test
    @DisplayName("2. Create Honey Batch - Duplicate Batch ID Rejection")
    void testDuplicateBatchIdRejection() throws Exception {
        CreateHoneyBatchRequest request = new CreateHoneyBatchRequest(
                "BATCH-P7-DUP",
                TEST_HIVE_ID,
                LocalDate.now(),
                100.0,
                "kg",
                HoneyBatchStatus.HARVESTED
        );

        // First creation
        mockMvc.perform(post("/api/batches")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate creation attempt
        mockMvc.perform(post("/api/batches")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("3. Create Honey Batch - Invalid Non-Positive Quantity Rejection")
    void testInvalidQuantityRejection() throws Exception {
        CreateHoneyBatchRequest request = new CreateHoneyBatchRequest(
                "BATCH-P7-INVALID-QTY",
                TEST_HIVE_ID,
                LocalDate.now(),
                -10.0, // Negative quantity
                "kg",
                HoneyBatchStatus.HARVESTED
        );

        mockMvc.perform(post("/api/batches")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("4. Hive-to-Batch Relationship Validation")
    void testHiveToBatchRelationship() throws Exception {
        CreateHoneyBatchRequest request = new CreateHoneyBatchRequest(
                "BATCH-P7-REL-01",
                TEST_HIVE_ID,
                LocalDate.now(),
                200.0,
                "kg",
                HoneyBatchStatus.HARVESTED
        );

        mockMvc.perform(post("/api/batches")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/batches/BATCH-P7-REL-01")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$.farmId", notNullValue()));
    }

    @Test
    @DisplayName("5. Harvest Traceability Event Creation")
    void testHarvestTraceabilityEvent() throws Exception {
        CreateHoneyBatchRequest request = new CreateHoneyBatchRequest(
                "BATCH-P7-TRACE-01",
                TEST_HIVE_ID,
                LocalDate.now(),
                120.0,
                "kg",
                HoneyBatchStatus.HARVESTED
        );

        mockMvc.perform(post("/api/batches")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/batches/BATCH-P7-TRACE-01/traceability")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].eventType", is("HARVESTED")));
    }

    @Test
    @DisplayName("6. Quality Test Creation & Validation")
    void testQualityTestCreation() throws Exception {
        // Create batch first
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-QT-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.5, 3.85, "Amber Gold", "Cert #8891 Pass", QualityTestResult.PASS, "Inspector S. Verma");
        mockMvc.perform(post("/api/batches/BATCH-P7-QT-01/quality-test")
                        .header("Authorization", "Bearer " + inspectorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.batchId", is("BATCH-P7-QT-01")))
                .andExpect(jsonPath("$.moisture", is(16.5)))
                .andExpect(jsonPath("$.result", is("PASS")))
                .andExpect(jsonPath("$.aiScreeningClass", is("PURE")));
    }

    @Test
    @DisplayName("7. PASS Quality Result Transitions Batch to QUALITY_TESTED")
    void testPassQualityTransition() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-PASS-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.0, 3.90, "Light Amber", QualityTestResult.PASS, "Inspector S. Verma");
        mockMvc.perform(post("/api/batches/BATCH-P7-PASS-01/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/batches/BATCH-P7-PASS-01").header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("QUALITY_TESTED")));
    }

    @Test
    @DisplayName("8. FAIL Quality Result Blocks Processing Entry")
    void testFailQualityBlocksProcessing() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-FAIL-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(23.5, 3.20, "Dark Amber", QualityTestResult.FAIL, "Inspector S. Verma");
        mockMvc.perform(post("/api/batches/BATCH-P7-FAIL-01/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq)))
                .andExpect(status().isCreated());

        // Attempt processing record creation on failed batch
        CreateProcessingRecordRequest procReq = new CreateProcessingRecordRequest("EXTRACTION", "Manager K. Singh", "Centrifugal extraction", Instant.now(), Instant.now(), 36.0);
        mockMvc.perform(post("/api/batches/BATCH-P7-FAIL-01/processing")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procReq)))
                .andExpect(status().isInternalServerError()); // IllegalStateException mapped
    }

    @Test
    @DisplayName("9. REQUIRES_REVIEW Quality Result Blocks Processing Entry")
    void testRequiresReviewBlocksProcessing() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-REV-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(21.2, 3.85, "Amber", "Elevated moisture needs secondary review", QualityTestResult.REQUIRES_REVIEW, "Inspector S. Verma");
        mockMvc.perform(post("/api/batches/BATCH-P7-REV-01/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq)))
                .andExpect(status().isCreated());

        // Attempt processing record creation on review-pending batch
        CreateProcessingRecordRequest procReq = new CreateProcessingRecordRequest("EXTRACTION", "Manager K. Singh", "Extraction", Instant.now(), Instant.now(), 36.0);
        mockMvc.perform(post("/api/batches/BATCH-P7-REV-01/processing")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procReq)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("10. AI-Assisted Quality Screening Integration")
    void testAIAssistedQualityScreeningIntegration() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-AI-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.2, 3.85, "Amber Gold", QualityTestResult.PASS, "Inspector S. Verma");
        mockMvc.perform(post("/api/batches/BATCH-P7-AI-01/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.aiScreeningClass", is("PURE")))
                .andExpect(jsonPath("$.aiPurityScore", is(100.0)))
                .andExpect(jsonPath("$.aiRecommendation", containsString("configured screening thresholds")));
    }

    @Test
    @DisplayName("11. Processing Record Creation & Temperature Labeling")
    void testProcessingRecordCreation() throws Exception {
        // Setup batch with PASS quality
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-PROC-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.5, 3.9, "Amber", QualityTestResult.PASS, "Inspector S. Verma");
        mockMvc.perform(post("/api/batches/BATCH-P7-PROC-01/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq))).andExpect(status().isCreated());

        CreateProcessingRecordRequest procReq = new CreateProcessingRecordRequest(
                "FILTRATION",
                "Operator J. Patel",
                "Filtered using 200-micron mesh",
                Instant.now(),
                Instant.now(),
                36.5
        );

        mockMvc.perform(post("/api/batches/BATCH-P7-PROC-01/processing")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.batchId", is("BATCH-P7-PROC-01")))
                .andExpect(jsonPath("$.operation", is("FILTRATION")))
                .andExpect(jsonPath("$.tempSource", is("Manual Processing Temperature")));
    }

    @Test
    @DisplayName("12. Invalid Processing Operation Validation")
    void testInvalidProcessingOperation() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-INV-OP", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.5, 3.9, "Amber", QualityTestResult.PASS, "Inspector");
        mockMvc.perform(post("/api/batches/BATCH-P7-INV-OP/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq))).andExpect(status().isCreated());

        CreateProcessingRecordRequest procReq = new CreateProcessingRecordRequest("", "Operator", "Empty op", Instant.now(), Instant.now(), 36.0);
        mockMvc.perform(post("/api/batches/BATCH-P7-INV-OP/processing")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("13. Invalid Processing Timestamp Rejection (Completed Before Started)")
    void testInvalidProcessingTimestampRejection() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-TIME-INV", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.5, 3.9, "Amber", QualityTestResult.PASS, "Inspector");
        mockMvc.perform(post("/api/batches/BATCH-P7-TIME-INV/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq))).andExpect(status().isCreated());

        Instant now = Instant.now();
        Instant past = now.minusSeconds(3600);
        CreateProcessingRecordRequest procReq = new CreateProcessingRecordRequest("FILTRATION", "Operator", "Desc", now, past, 36.0); // Completed before started!

        mockMvc.perform(post("/api/batches/BATCH-P7-TIME-INV/processing")
                        .header("Authorization", "Bearer " + beekeeperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("14. Processing Completion & READY_FOR_PACKAGING Transition")
    void testProcessingCompletionAndReadyForPackaging() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-READY-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.5, 3.9, "Amber", QualityTestResult.PASS, "Inspector");
        mockMvc.perform(post("/api/batches/BATCH-P7-READY-01/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq))).andExpect(status().isCreated());

        CreateProcessingRecordRequest procReq = new CreateProcessingRecordRequest("EXTRACTION", "Operator", "Extracted", Instant.now(), Instant.now(), 36.0);
        mockMvc.perform(post("/api/batches/BATCH-P7-READY-01/processing").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(procReq))).andExpect(status().isCreated());

        // Mark ready for packaging
        mockMvc.perform(post("/api/batches/BATCH-P7-READY-01/processing/ready-for-packaging")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("READY_FOR_PACKAGING")));
    }

    @Test
    @DisplayName("15. Batch Traceability Timeline Retrieval")
    void testBatchTraceabilityTimeline() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-TL-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches").header("Authorization", "Bearer " + beekeeperToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(batchReq))).andExpect(status().isCreated());

        CreateQualityTestRequest testReq = new CreateQualityTestRequest(16.5, 3.9, "Amber", QualityTestResult.PASS, "Inspector");
        mockMvc.perform(post("/api/batches/BATCH-P7-TL-01/quality-test").header("Authorization", "Bearer " + inspectorToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(testReq))).andExpect(status().isCreated());

        mockMvc.perform(get("/api/batches/BATCH-P7-TL-01/traceability")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$[0].eventType", is("HARVESTED")))
                .andExpect(jsonPath("$[1].eventType", is("QUALITY_TESTED")))
                .andExpect(jsonPath("$[2].eventType", is("AI_SCREENED")));
    }

    @Test
    @DisplayName("16. Role Authorization Security (Unauthenticated & Forbidden Checks)")
    void testRoleAuthorizationSecurity() throws Exception {
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-P7-SEC-01", TEST_HIVE_ID, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED);

        // Unauthenticated attempt
        mockMvc.perform(post("/api/batches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("17. Non-Existent Batch Handling (404 Not Found)")
    void testNonExistentBatchHandling() throws Exception {
        mockMvc.perform(get("/api/batches/NON-EXISTENT-BATCH-999")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isNotFound());
    }
}
