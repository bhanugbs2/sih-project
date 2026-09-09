package com.nexora.honeychain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.blockchain.BlockchainProperties;
import com.nexora.honeychain.blockchain.BlockchainService;
import com.nexora.honeychain.blockchain.TraceabilityHashService;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.TraceabilityEvent;
import com.nexora.honeychain.model.User;
import com.nexora.honeychain.model.enums.*;
import com.nexora.honeychain.repository.FarmRepository;
import com.nexora.honeychain.repository.HiveRepository;
import com.nexora.honeychain.repository.HoneyBatchRepository;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
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
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class Phase8BlockchainIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    @Autowired private FarmRepository farmRepository;
    @Autowired private HiveRepository hiveRepository;
    @Autowired private HoneyBatchRepository honeyBatchRepository;
    @Autowired private TraceabilityEventRepository traceabilityEventRepository;

    @Autowired private TraceabilityHashService hashService;
    @Autowired private BlockchainService blockchainService;
    @Autowired private BlockchainProperties properties;

    private String beekeeperToken;
    private HoneyBatch testBatch;
    private TraceabilityEvent testEvent;

    @BeforeEach
    void setUp() {
        if (!userRepository.existsByUsername("beekeeper")) {
            userRepository.save(new User("beekeeper", "beekeeper@honeychain.io", passwordEncoder.encode("Beekeeper@12345"), UserRole.BEEKEEPER));
        }
        beekeeperToken = jwtService.generateToken("beekeeper", UserRole.BEEKEEPER);

        Farm farm = farmRepository.save(new Farm("FARM-P8-TEST", "Phase 8 Apiary", "Master Beekeeper", "Shimla, India", 31.10, 77.17));
        Hive hive = hiveRepository.save(new Hive("HIVE-P8-TEST", farm, "Phase 8 Test Hive", "Super A", 31.10, 77.17, HiveStatus.ACTIVE));
        testBatch = honeyBatchRepository.save(new HoneyBatch("BATCH-P8-TEST-01", hive, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED));

        testEvent = new TraceabilityEvent(
                testBatch,
                null,
                TraceabilityEventType.HARVESTED,
                "HASH-INITIAL-DATA",
                Instant.now(),
                "REF-P8-INIT",
                BlockchainEnvironment.DEVELOPMENT
        );
        testEvent = traceabilityEventRepository.save(testEvent);
    }

    @Test
    @DisplayName("1. SHA-256 Deterministic Hashing - Same Parameters -> Same Hash")
    void testDeterministicSHA256HashingSameInput() {
        Instant now = Instant.now();
        String hash1 = hashService.calculateCanonicalHash("BATCH-001", "PKG-001", TraceabilityEventType.HARVESTED, "Notes", now);
        String hash2 = hashService.calculateCanonicalHash("BATCH-001", "PKG-001", TraceabilityEventType.HARVESTED, "Notes", now);

        assertNotNull(hash1);
        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length()); // SHA-256 hex string is 64 characters
    }

    @Test
    @DisplayName("2. SHA-256 Hashing - Different Parameters -> Different Hash")
    void testDeterministicSHA256HashingDifferentInput() {
        Instant now = Instant.now();
        String hash1 = hashService.calculateCanonicalHash("BATCH-001", "PKG-001", TraceabilityEventType.HARVESTED, "Notes", now);
        String hash2 = hashService.calculateCanonicalHash("BATCH-002", "PKG-001", TraceabilityEventType.HARVESTED, "Notes", now);

        assertNotEquals(hash1, hash2);
    }

    @Test
    @DisplayName("3. Unconfigured Blockchain RPC -> Fallback to NOT_CONFIGURED & NO Fake Tx Hash")
    void testUnconfiguredBlockchainFallbackNoFakeHash() {
        TraceabilityEvent anchored = blockchainService.anchorEvent(testEvent.getId());

        assertNotNull(anchored);
        assertEquals(BlockchainStatus.NOT_CONFIGURED, anchored.getBlockchainStatus());
        assertNotNull(anchored.getBlockchainDataHash());
        assertNull(anchored.getBlockchainTransactionHash()); // Strictly NO fake transaction hash!
    }

    @Test
    @DisplayName("4. API POST /api/blockchain/anchor/{eventId} Success")
    void testAnchorApiEndpointSuccess() throws Exception {
        mockMvc.perform(post("/api/blockchain/anchor/" + testEvent.getId())
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testEvent.getId())))
                .andExpect(jsonPath("$.blockchainStatus", is("NOT_CONFIGURED")))
                .andExpect(jsonPath("$.blockchainDataHash", notNullValue()))
                .andExpect(jsonPath("$.blockchainTransactionHash").doesNotExist());
    }

    @Test
    @DisplayName("5. API GET /api/blockchain/status Public Access")
    void testBlockchainStatusEndpointPublic() throws Exception {
        mockMvc.perform(get("/api/blockchain/status"))
                .andExpect(status().isOk())
        .andExpect(jsonPath("$.enabled", notNullValue()))
        .andExpect(jsonPath("$.configured", notNullValue()))
        .andExpect(jsonPath("$.networkName", notNullValue()));
    }

    @Test
    @DisplayName("6. API GET /api/blockchain/batch/{batchId} Returns Batch Traceability")
    void testGetBatchBlockchainTraceability() throws Exception {
        mockMvc.perform(get("/api/blockchain/batch/" + testBatch.getBatchId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].batchId", is(testBatch.getBatchId())))
                .andExpect(jsonPath("$[0].eventType", is("HARVESTED")));
    }

    @Test
    @DisplayName("7. Security - Unauthenticated Anchor Attempt -> 401 Unauthorized")
    void testUnauthenticatedAnchorAttempt() throws Exception {
        mockMvc.perform(post("/api/blockchain/anchor/" + testEvent.getId()))
                .andExpect(status().isUnauthorized());
    }
}
