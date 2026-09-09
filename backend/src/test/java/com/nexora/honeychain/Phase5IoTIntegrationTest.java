package com.nexora.honeychain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.enums.HiveStatus;
import com.nexora.honeychain.repository.*;
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
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class Phase5IoTIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired private FarmRepository farmRepository;
    @Autowired private HiveRepository hiveRepository;
    @Autowired private SensorReadingRepository sensorReadingRepository;

    private Hive testHive;
    private static final String TEST_HIVE_ID = "HIVE-P5-TEST-01";

    @BeforeEach
    void setUp() {
        if (!hiveRepository.existsByHiveId(TEST_HIVE_ID)) {
            Farm farm = farmRepository.findAll().stream().findFirst().orElseGet(() ->
                    farmRepository.save(new Farm("FARM-P5-TEST", "Phase 5 Test Apiary", "John Beekeeper", "Shimla, India", 31.10, 77.17))
            );
            testHive = hiveRepository.save(new Hive(TEST_HIVE_ID, farm, "Physical ESP32 Test Hive", "Section A", 31.10, 77.17, HiveStatus.ACTIVE));
        } else {
            testHive = hiveRepository.findByHiveId(TEST_HIVE_ID).orElseThrow();
        }
    }

    @Test
    @DisplayName("1. ESP32 M2M API Key Telemetry Ingestion (Temp + Humidity, Null Optional Hardware)")
    void testEsp32M2mTelemetryIngestion() throws Exception {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                TEST_HIVE_ID,
                28.4,   // temperature
                62.5,   // humidity
                null,   // weight (Load Cell deferred)
                null,   // soundLevel (Microphone deferred)
                null,   // latitude (GPS deferred)
                null,   // longitude (GPS deferred)
                System.currentTimeMillis() / 1000L
        );

        mockMvc.perform(post("/api/sensors")
                        .header("X-IoT-API-Key", "HoneyChain-IoT-Device-Key-2026")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$.temperature", is(28.4)))
                .andExpect(jsonPath("$.humidity", is(62.5)))
                .andExpect(jsonPath("$.weight", nullValue()))
                .andExpect(jsonPath("$.soundLevel", nullValue()));
    }

    @Test
    @DisplayName("2. JWT Authenticated Beekeeper Telemetry Ingestion")
    @WithMockUser(username = "beekeeper", roles = {"BEEKEEPER"})
    void testAuthenticatedBeekeeperTelemetryIngestion() throws Exception {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                TEST_HIVE_ID,
                29.1,
                58.0,
                null,
                null,
                null,
                null,
                System.currentTimeMillis() / 1000L
        );

        mockMvc.perform(post("/api/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$.temperature", is(29.1)))
                .andExpect(jsonPath("$.humidity", is(58.0)));
    }

    @Test
    @DisplayName("3. Latest Reading Endpoint returns ingested telemetry")
    @WithMockUser(username = "beekeeper", roles = {"BEEKEEPER"})
    void testGetLatestReadingAfterIngestion() throws Exception {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                TEST_HIVE_ID,
                30.5,
                64.2,
                null,
                null,
                null,
                null,
                System.currentTimeMillis() / 1000L
        );

        mockMvc.perform(post("/api/sensors")
                        .header("X-IoT-API-Key", "HoneyChain-IoT-Device-Key-2026")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/hives/" + TEST_HIVE_ID + "/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hiveId", is(TEST_HIVE_ID)))
                .andExpect(jsonPath("$.temperature", is(30.5)))
                .andExpect(jsonPath("$.humidity", is(64.2)));
    }

    @Test
    @DisplayName("4. History Endpoint returns incoming telemetry series")
    @WithMockUser(username = "beekeeper", roles = {"BEEKEEPER"})
    void testGetHistoryAfterIngestion() throws Exception {
        for (int i = 1; i <= 3; i++) {
            CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                    TEST_HIVE_ID,
                    25.0 + i,
                    50.0 + i,
                    null,
                    null,
                    null,
                    null,
                    (System.currentTimeMillis() / 1000L) + i
            );

            mockMvc.perform(post("/api/sensors")
                            .header("X-IoT-API-Key", "HoneyChain-IoT-Device-Key-2026")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/hives/" + TEST_HIVE_ID + "/history?limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    @DisplayName("5. Validation Rejection on Out-of-Range Humidity (> 100%)")
    @WithMockUser(username = "beekeeper", roles = {"BEEKEEPER"})
    void testValidationOutofRangeHumidity() throws Exception {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                TEST_HIVE_ID,
                28.0,
                150.0, // Invalid humidity > 100
                null,
                null,
                null,
                null,
                System.currentTimeMillis() / 1000L
        );

        mockMvc.perform(post("/api/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("6. 404 Rejection when posting telemetry for Non-Existent Hive")
    @WithMockUser(username = "beekeeper", roles = {"BEEKEEPER"})
    void testNonExistentHiveTelemetry() throws Exception {
        CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                "HIVE-DEFINITELY-NOT-EXISTING-9999",
                28.0,
                55.0,
                null,
                null,
                null,
                null,
                System.currentTimeMillis() / 1000L
        );

        mockMvc.perform(post("/api/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
}
