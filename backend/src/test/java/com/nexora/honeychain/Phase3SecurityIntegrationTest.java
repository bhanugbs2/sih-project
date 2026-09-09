package com.nexora.honeychain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.dto.auth.LoginRequest;
import com.nexora.honeychain.dto.auth.RegisterRequest;
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
class Phase3SecurityIntegrationTest {

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

    private String adminToken;
    private String beekeeperToken;
    private String inspectorToken;

    @BeforeEach
    void setUp() {
        // Ensure test demo users exist
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new User("admin", "admin@honeychain.io", passwordEncoder.encode("Admin@12345"), UserRole.ADMIN));
        }
        if (!userRepository.existsByUsername("beekeeper")) {
            userRepository.save(new User("beekeeper", "beekeeper@honeychain.io", passwordEncoder.encode("Beekeeper@12345"), UserRole.BEEKEEPER));
        }
        if (!userRepository.existsByUsername("inspector")) {
            userRepository.save(new User("inspector", "inspector@honeychain.io", passwordEncoder.encode("Inspector@12345"), UserRole.QUALITY_INSPECTOR));
        }

        // Ensure prerequisite data exists for batch and package testing
        if (!farmRepository.existsByFarmId("FARM-TEST-01")) {
            Farm farm = farmRepository.save(new Farm("FARM-TEST-01", "Test Apiary", "Test Owner", "Test Location", 31.0, 77.0));
            Hive hive = hiveRepository.save(new Hive("HIVE-TEST-01", farm, "Test Hive #1", "Section A", 31.0, 77.0, HiveStatus.ACTIVE));
            HoneyBatch batch = honeyBatchRepository.save(new HoneyBatch("HC-BATCH-2026-VALLEY-09", hive, LocalDate.now(), 100.0, "kg", HoneyBatchStatus.HARVESTED));
            packageRepository.save(new Package("HC-PKG-2026-001", batch, "https://honeychain.io/verify/HC-PKG-2026-001", PackageStatus.PACKAGED, Instant.now()));
        }

        adminToken = jwtService.generateToken("admin", UserRole.ADMIN);
        beekeeperToken = jwtService.generateToken("beekeeper", UserRole.BEEKEEPER);
        inspectorToken = jwtService.generateToken("inspector", UserRole.QUALITY_INSPECTOR);
    }

    @Test
    @DisplayName("1. Login Success - Valid Credentials")
    void testLoginSuccess() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin", "Admin@12345");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.username", is("admin")))
                .andExpect(jsonPath("$.role", is("ADMIN")))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("2. Login Failure - Wrong Password")
    void testLoginWrongPassword() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin", "WrongPassword123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid username or password.")));
    }

    @Test
    @DisplayName("3. Login Failure - Unknown Username")
    void testLoginUnknownUser() throws Exception {
        LoginRequest loginReq = new LoginRequest("nonexistent_user", "Admin@12345");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid username or password.")));
    }

    @Test
    @DisplayName("4 & 5. JWT Generation and Validation")
    void testJwtGenerationAndValidation() {
        String token = jwtService.generateToken("beekeeper", UserRole.BEEKEEPER);
        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        assertEquals("beekeeper", jwtService.extractUsername(token));
        assertEquals("BEEKEEPER", jwtService.extractRole(token));
    }

    @Test
    @DisplayName("6. Protected Endpoint Without JWT -> 401 Unauthorized")
    void testProtectedEndpointWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/hives"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("7. Protected Endpoint With Valid JWT -> 200 OK")
    void testProtectedEndpointWithValidJwt() throws Exception {
        mockMvc.perform(get("/api/hives")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("8. ADMIN Endpoint With ADMIN JWT -> Access Allowed")
    void testAdminEndpointWithAdminJwt() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("9. ADMIN Endpoint With BEEKEEPER JWT -> 403 Forbidden")
    void testAdminEndpointWithBeekeeperJwt() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. BEEKEEPER Endpoint With BEEKEEPER JWT -> Access Allowed")
    void testBeekeeperEndpointWithBeekeeperJwt() throws Exception {
        mockMvc.perform(get("/api/hives")
                        .header("Authorization", "Bearer " + beekeeperToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("11. QUALITY_INSPECTOR Quality Endpoint -> Access Allowed")
    void testQualityInspectorEndpoint() throws Exception {
        mockMvc.perform(get("/api/batches/HC-BATCH-2026-VALLEY-09/quality-test")
                        .header("Authorization", "Bearer " + inspectorToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("12. Customer Verification Without JWT -> 200 OK (Public)")
    void testCustomerVerificationPublic() throws Exception {
        mockMvc.perform(get("/api/verify/HC-PKG-2026-001"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("13. Health Endpoint Without JWT -> 200 OK (Public)")
    void testHealthEndpointPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")));
    }

    @Test
    @DisplayName("14. Passwords Are Stored as BCrypt Hashes")
    void testPasswordStoredAsBcrypt() {
        User user = userRepository.findByUsername("admin").orElseThrow();
        assertTrue(user.getPasswordHash().startsWith("$2a$") || user.getPasswordHash().startsWith("$2b$"));
        assertNotEquals("Admin@12345", user.getPasswordHash());
    }

    @Test
    @DisplayName("15. Password Hash Is Never Exposed in Responses")
    void testPasswordHashNotExposed() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("admin")))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("16. Disabled User Cannot Authenticate -> 401 Unauthorized")
    void testDisabledUserCannotLogin() throws Exception {
        User disabledUser = new User("disabled_user", "disabled@honeychain.io", passwordEncoder.encode("DisabledPass123"), UserRole.BEEKEEPER, false);
        userRepository.save(disabledUser);

        LoginRequest loginReq = new LoginRequest("disabled_user", "DisabledPass123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("User account is disabled.")));
    }

    @Test
    @DisplayName("17. Registration - Duplicate Username -> 409 Conflict")
    void testDuplicateUsernameRegistration() throws Exception {
        RegisterRequest regReq = new RegisterRequest("admin", "newadmin@honeychain.io", "Password123", UserRole.ADMIN);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("18. Registration - Duplicate Email -> 409 Conflict")
    void testDuplicateEmailRegistration() throws Exception {
        RegisterRequest regReq = new RegisterRequest("uniqueuser", "admin@honeychain.io", "Password123", UserRole.BEEKEEPER);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isConflict());
    }
}
