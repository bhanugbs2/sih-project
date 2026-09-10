package com.nexora.honeychain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.blockchain.TraceabilityHashService;
import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.model.User;
import com.nexora.honeychain.model.enums.*;
import com.nexora.honeychain.repository.*;
import com.nexora.honeychain.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase19SecurityAuditTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private HiveRepository hiveRepository;

    @Autowired
    private HoneyBatchRepository honeyBatchRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TraceabilityHashService hashService;

    @Value("${honeychain.iot.api-key:HoneyChain-IoT-Device-Key-2026}")
    private String iotApiKey;

    private String adminToken;
    private String beekeeperToken;
    private String inspectorToken;

    @BeforeEach
    void setUp() {
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new User("admin", "admin@honeychain.io", passwordEncoder.encode("Admin@12345"), UserRole.ADMIN));
        }
        if (!userRepository.existsByUsername("beekeeper")) {
            userRepository.save(new User("beekeeper", "beekeeper@honeychain.io", passwordEncoder.encode("Beekeeper@12345"), UserRole.BEEKEEPER));
        }
        if (!userRepository.existsByUsername("inspector")) {
            userRepository.save(new User("inspector", "inspector@honeychain.io", passwordEncoder.encode("Inspector@12345"), UserRole.QUALITY_INSPECTOR));
        }

        if (!farmRepository.existsByFarmId("FARM-SEC-01")) {
            Farm farm = farmRepository.save(new Farm("FARM-SEC-01", "Security Apiary", "Security Owner", "Location Sec", 31.5, 77.5));
            Hive hive = hiveRepository.save(new Hive("HIVE-SEC-01", farm, "Sec Hive", "Section S", 31.5, 77.5, HiveStatus.ACTIVE));
            HoneyBatch batch = honeyBatchRepository.save(new HoneyBatch("HC-BATCH-SEC-99", hive, LocalDate.now(), 150.0, "kg", HoneyBatchStatus.HARVESTED));
            packageRepository.save(new Package("HC-PKG-SEC-001", batch, "https://honeychain.io/verify/HC-PKG-SEC-001", PackageStatus.PACKAGED, Instant.now()));
        }

        adminToken = jwtService.generateToken("admin", UserRole.ADMIN);
        beekeeperToken = jwtService.generateToken("beekeeper", UserRole.BEEKEEPER);
        inspectorToken = jwtService.generateToken("inspector", UserRole.QUALITY_INSPECTOR);
    }

    @Test
    @DisplayName("1. Tampered / Invalid JWT -> 401 Unauthorized")
    void testTamperedJwtRejected() throws Exception {
        String tamperedToken = adminToken + "tamperedString";
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. Malformed JWT Header -> 401 Unauthorized")
    void testMalformedJwtRejected() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer invalid.jwt.structure"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. Unauthenticated User Endpoint Access -> 401 Unauthorized")
    void testUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. BEEKEEPER Privilege Boundary Test (Cannot Access /api/users) -> 403 Forbidden")
    void testBeekeeperPrivilegeBoundary() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. QUALITY_INSPECTOR Privilege Boundary Test (Cannot Access /api/users) -> 403 Forbidden")
    void testInspectorPrivilegeBoundary() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + inspectorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. ADMIN Access to /api/users -> 200 OK")
    void testAdminPrivilegeSuccess() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    @DisplayName("7. IoT API Key Authentication Success -> 201 Created")
    void testIotApiKeyAuthenticationSuccess() throws Exception {
        CreateSensorReadingRequest sensorDTO = new CreateSensorReadingRequest("HIVE-SEC-01", 34.5, 62.0, null, null, null, null, System.currentTimeMillis() / 1000L);
        mockMvc.perform(post("/api/sensors")
                        .header("X-IoT-API-Key", iotApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sensorDTO)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("8. Invalid IoT API Key -> 401 Unauthorized")
    void testInvalidIotApiKeyRejected() throws Exception {
        CreateSensorReadingRequest sensorDTO = new CreateSensorReadingRequest("HIVE-SEC-01", 34.5, 62.0, null, null, null, null, System.currentTimeMillis() / 1000L);
        mockMvc.perform(post("/api/sensors")
                        .header("X-IoT-API-Key", "Invalid-Key-12345")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sensorDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("9. Malformed Sensor Data (Humidity > 100) -> 400 Bad Request")
    void testMalformedSensorDataRejected() throws Exception {
        CreateSensorReadingRequest sensorDTO = new CreateSensorReadingRequest("HIVE-SEC-01", 35.0, 150.0, null, null, null, null, System.currentTimeMillis() / 1000L);
        mockMvc.perform(post("/api/sensors")
                        .header("X-IoT-API-Key", iotApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sensorDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("10. Public Verification Boundary -> Safe 200 OK without Credentials")
    void testPublicVerificationSafety() throws Exception {
        mockMvc.perform(get("/api/verify/HC-PKG-SEC-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.package.packageId", is("HC-PKG-SEC-001")))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.jwtSecret").doesNotExist());
    }

    @Test
    @DisplayName("11. Public Verification Nonexistent Package -> 404 Not Found")
    void testPublicVerificationNonexistentPackage() throws Exception {
        mockMvc.perform(get("/api/verify/NONEXISTENT-PKG-999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("12. Deterministic Hash Integrity Verification")
    void testHashIntegrity() {
        Instant now = Instant.parse("2026-09-10T10:00:00Z");
        Instant later = Instant.parse("2026-09-10T10:00:01Z");
        String hash1 = hashService.calculateCanonicalHash("BATCH-001", "PKG-001", TraceabilityEventType.HARVESTED, "meta", now);
        String hash2 = hashService.calculateCanonicalHash("BATCH-001", "PKG-001", TraceabilityEventType.HARVESTED, "meta", now);
        String hashTampered = hashService.calculateCanonicalHash("BATCH-001", "PKG-001", TraceabilityEventType.HARVESTED, "meta", later);

        assertEquals(hash1, hash2, "Identical inputs must produce identical SHA-256 hash");
        assertNotEquals(hash1, hashTampered, "Tampered timestamp must produce different hash");
    }
}
