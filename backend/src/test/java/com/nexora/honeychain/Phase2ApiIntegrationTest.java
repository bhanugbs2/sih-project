package com.nexora.honeychain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.dto.*;
import com.nexora.honeychain.model.enums.HiveStatus;
import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import com.nexora.honeychain.model.enums.QualityTestResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "admin", roles = {"ADMIN", "BEEKEEPER", "QUALITY_INSPECTOR"})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class Phase2ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @Order(1)
    @DisplayName("1. Health Endpoint Verification")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", is("HoneyChain Backend")))
                .andExpect(jsonPath("$.version", is("1.0.0")));
    }

    @Test
    @Order(2)
    @DisplayName("2. Complete Sequential Demo API Flow")
    void testCompleteDemoApiFlow() throws Exception {
        // Step 1: POST /api/farms
        CreateFarmRequest farmReq = new CreateFarmRequest("farm-001", "Green Valley Apiary", "Demo Beekeeper", "Demo Location", 20.5937, 78.9629);
        mockMvc.perform(post("/api/farms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(farmReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.farmId", is("farm-001")))
                .andExpect(jsonPath("$.name", is("Green Valley Apiary")));

        // Step 2: POST /api/hives
        CreateHiveRequest hiveReq = new CreateHiveRequest("hive-001", "farm-001", "Hive 001", "North Field", 20.5937, 78.9629, HiveStatus.ACTIVE);
        mockMvc.perform(post("/api/hives")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hiveReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hiveId", is("hive-001")))
                .andExpect(jsonPath("$.farmId", is("farm-001")));

        // Step 3: POST /api/sensors
        CreateSensorReadingRequest sensorReq = new CreateSensorReadingRequest("hive-001", 35.0, 58.0, 2047.0, 230.0, 20.5937, 78.9629, 1700000000L);
        mockMvc.perform(post("/api/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sensorReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hiveId", is("hive-001")))
                .andExpect(jsonPath("$.temperature", is(35.0)))
                .andExpect(jsonPath("$.humidity", is(58.0)))
                .andExpect(jsonPath("$.timestamp", is(1700000000)));

        // Step 4: GET /api/hives/hive-001/latest
        mockMvc.perform(get("/api/hives/hive-001/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hiveId", is("hive-001")))
                .andExpect(jsonPath("$.temperature", is(35.0)));

        // Step 5: GET /api/hives/hive-001/history
        mockMvc.perform(get("/api/hives/hive-001/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].hiveId", is("hive-001")));

        // Step 6: POST /api/batches
        CreateHoneyBatchRequest batchReq = new CreateHoneyBatchRequest("BATCH-001", "hive-001", LocalDate.of(2026, 9, 7), 25.5, "KG", HoneyBatchStatus.HARVESTED);
        mockMvc.perform(post("/api/batches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.batchId", is("BATCH-001")))
                .andExpect(jsonPath("$.quantity", is(25.5)));

        // Step 7: POST /api/batches/BATCH-001/quality-test
        CreateQualityTestRequest testReq = new CreateQualityTestRequest(17.5, 4.2, "Amber", QualityTestResult.PASS, "Quality Inspector");
        mockMvc.perform(post("/api/batches/BATCH-001/quality-test")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.moisture", is(17.5)))
                .andExpect(jsonPath("$.result", is("PASS")));

        // Step 8: POST /api/batches/BATCH-001/processing
        CreateProcessingRecordRequest procReq = new CreateProcessingRecordRequest("FILTERING", "Honey filtered before packaging", "Processing Operator");
        mockMvc.perform(post("/api/batches/BATCH-001/processing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.processType", is("FILTERING")));

        // Step 9: POST /api/packages
        CreatePackageRequest pkgReq = new CreatePackageRequest("PKG-001", "BATCH-001", "2026-09-07", com.nexora.honeychain.model.enums.PackageStatus.PACKAGED);
        mockMvc.perform(post("/api/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pkgReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.packageId", is("PKG-001")))
                .andExpect(jsonPath("$.batchId", is("BATCH-001")));

        // Step 10: GET /api/verify/PKG-001
        mockMvc.perform(get("/api/verify/PKG-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.package.packageId", is("PKG-001")))
                .andExpect(jsonPath("$.batch.batchId", is("BATCH-001")))
                .andExpect(jsonPath("$.hive.hiveId", is("hive-001")))
                .andExpect(jsonPath("$.farm.farmId", is("farm-001")))
                .andExpect(jsonPath("$.qualityTests", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.processingRecords", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.traceabilityEvents", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.blockchainVerificationStatus", is("PENDING")));
    }

    @Test
    @Order(3)
    @DisplayName("3. Validation & Exception Handling Tests")
    void testValidationAndExceptions() throws Exception {
        // 409 Duplicate Farm
        CreateFarmRequest dupFarmReq = new CreateFarmRequest("farm-001", "Duplicate Farm", "Owner", "Loc", 10.0, 10.0);
        mockMvc.perform(post("/api/farms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupFarmReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("Conflict")))
                .andExpect(jsonPath("$.message", containsString("Farm with farmId already exists")));

        // 404 Unknown Farm for Hive Creation
        CreateHiveRequest unknownFarmHive = new CreateHiveRequest("hive-999", "farm-nonexistent", "Hive 999", "Loc", 10.0, 10.0, HiveStatus.ACTIVE);
        mockMvc.perform(post("/api/hives")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unknownFarmHive)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Farm not found")));

        // 400 Validation Error for Sensor Reading (Humidity > 100)
        CreateSensorReadingRequest invalidSensor = new CreateSensorReadingRequest("hive-001", 30.0, 150.0, 100.0, 40.0, 20.0, 78.0, 1700000000L);
        mockMvc.perform(post("/api/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidSensor)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Validation failed")));

        // 404 AI Status on Unknown Hive
        mockMvc.perform(get("/api/hives/hive-unknown/ai-status"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(4)
    @DisplayName("4. AI Status Foundation Test")
    void testAIStatusFoundation() throws Exception {
        mockMvc.perform(get("/api/hives/hive-001/ai-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hiveId", is("hive-001")))
                .andExpect(jsonPath("$.riskScore", is(0.0)))
                .andExpect(jsonPath("$.status", is("NORMAL")))
                .andExpect(jsonPath("$.message", is("No AI alert available yet.")));
    }

    @Test
    @Order(5)
    @DisplayName("5. Traceability Endpoint Verification")
    void testTraceabilityEndpoints() throws Exception {
        mockMvc.perform(get("/api/batches/BATCH-001/traceability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        mockMvc.perform(get("/api/packages/PKG-001/traceability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }
}
