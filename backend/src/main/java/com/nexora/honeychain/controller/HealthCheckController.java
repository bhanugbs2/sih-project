package com.nexora.honeychain.controller;

import com.nexora.honeychain.blockchain.BlockchainProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check API", description = "System health check endpoint")
public class HealthCheckController {

    private final DataSource dataSource;
    private final BlockchainProperties blockchainProperties;

    @Autowired
    public HealthCheckController(DataSource dataSource, BlockchainProperties blockchainProperties) {
        this.dataSource = dataSource;
        this.blockchainProperties = blockchainProperties;
    }

    @GetMapping
    @Operation(summary = "Health check endpoint", description = "Returns service, database, and blockchain status safely without credential exposure.")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();

        boolean isDbHealthy = false;
        try {
            if (dataSource != null) {
                try (Connection connection = dataSource.getConnection()) {
                    isDbHealthy = connection.isValid(3);
                }
            }
        } catch (Exception e) {
            isDbHealthy = false;
        }

        boolean isBlockchainConfigured = blockchainProperties != null && blockchainProperties.isConfigured();

        response.put("status", isDbHealthy ? "UP" : "DEGRADED");
        response.put("service", "HoneyChain Backend");
        response.put("version", "1.0.0");
        response.put("database", isDbHealthy ? "UP" : "DOWN");
        response.put("blockchain", isBlockchainConfigured ? "UP" : "DOWN");

        return ResponseEntity.ok(response);
    }
}
