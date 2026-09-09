package com.nexora.honeychain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import com.nexora.honeychain.dto.ai.QualityEvaluationRequest;
import com.nexora.honeychain.dto.ai.TelemetryAnalysisRequest;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.enums.HiveStatus;
import com.nexora.honeychain.repository.FarmRepository;
import com.nexora.honeychain.repository.HiveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class Phase6AIIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired private FarmRepository farmRepository;
    @Autowired private HiveRepository hiveRepository;

    private static final String TEST_HIVE_ID = "HIVE-P6-AI-TEST-01";

    @BeforeEach
    void setUp() {
        if (!hiveRepository.existsByHiveId(TEST_HIVE_ID)) {
            Farm farm = farmRepository.findAll().stream().findFirst().orElseGet(() ->
                    farmRepository.save(new Farm("FARM-P6-TEST", "Phase 6 AI Apiary", "AI Analyst", "Manali, India", 32.24, 77.18))
            );
            hiveRepository.save(new Hive(TEST_HIVE_ID, farm, "AI Intelligence Test Hive", "Section B", 32.24, 77.18, HiveStatus.ACTIVE));
        }
    }

    @Test
    @DisplayName("1. Evaluate Quality - Standard Pure Honey Sample (100% Purity)")
    @WithMockUser(username = "inspector", roles = {"QUALITY_INSPECTOR"})
    void testEvaluatePureHoneyQuality() throws Exception {
        QualityEvaluationRequest request = new QualityEvaluationRequest("BATCH-P6-001", 16.5, 3.8, "Amber");

        mockMvc.perform(post("/api/ai/evaluate-quality")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.batchId", is("BATCH-P6-001")))
                .andExpect(jsonPath("$.purityScore", is(100.0)))
                .andExpect(jsonPath("$.adulterationClass", is("PURE")))
                .andExpect(jsonPath("$.recommendation", containsString("within the configured screening thresholds")));
    }

    @Test
    @DisplayName("2. Evaluate Quality - High Moisture Diluted Honey Sample")
    @WithMockUser(username = "inspector", roles = {"QUALITY_INSPECTOR"})
    void testEvaluateDilutedHoneyQuality() throws Exception {
        QualityEvaluationRequest request = new QualityEvaluationRequest("BATCH-P6-002", 22.5, 3.9, "Light Amber");

        mockMvc.perform(post("/api/ai/evaluate-quality")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.batchId", is("BATCH-P6-002")))
                .andExpect(jsonPath("$.purityScore", lessThan(70.0)))
                .andExpect(jsonPath("$.adulterationClass", is("SUSPECTED_MOISTURE_DILUTION")))
                .andExpect(jsonPath("$.riskFactors", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("3. Analyze Telemetry - Optimal Hive Parameters (Zero Risk)")
    @WithMockUser(username = "beekeeper", roles = {"BEEKEEPER"})
    void testAnalyzeOptimalTelemetry() throws Exception {
        TelemetryAnalysisRequest request = new TelemetryAnalysisRequest(TEST_HIVE_ID, 35.0, 55.0, 230.0);

        mockMvc.perform(post("/api/ai/analyze-telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$.riskScore", is(0.0)))
                .andExpect(jsonPath("$.alertStatus", is("NORMAL")))
                .andExpect(jsonPath("$.message", containsString("Hive status optimal")));
    }

    @Test
    @DisplayName("4. Analyze Telemetry - High Thermal Anomaly & Acoustic Frequency Drift")
    @WithMockUser(username = "beekeeper", roles = {"BEEKEEPER"})
    void testAnalyzeCriticalTelemetry() throws Exception {
        TelemetryAnalysisRequest request = new TelemetryAnalysisRequest(TEST_HIVE_ID, 39.2, 72.0, 205.0);

        mockMvc.perform(post("/api/ai/analyze-telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$.riskScore", greaterThanOrEqualTo(40.0)))
                .andExpect(jsonPath("$.alertStatus", is("CRITICAL")))
                .andExpect(jsonPath("$.message", containsString("Abnormal hive pattern detected")));
    }

    @Test
    @DisplayName("5. Ingest Telemetry Auto-Generates AI Anomaly Alert")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testTelemetryIngestionAutoGeneratesAIAlert() throws Exception {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                TEST_HIVE_ID,
                38.5, // Overheating trigger
                75.0, // High humidity trigger
                null,
                210.0, // Sound drift
                null,
                null,
                System.currentTimeMillis() / 1000L
        );

        // Ingest telemetry via API key
        mockMvc.perform(post("/api/sensors")
                        .header("X-IoT-API-Key", "HoneyChain-IoT-Device-Key-2026")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Verify global AI alerts endpoint
        mockMvc.perform(get("/api/ai/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[0].hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$[0].status", is("CRITICAL")));

        // Verify hive-specific AI alerts endpoint
        mockMvc.perform(get("/api/hives/" + TEST_HIVE_ID + "/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[0].hiveId", is(TEST_HIVE_ID)));
    }
}
