package com.nexora.honeychain.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check API", description = "System health check endpoint")
public class HealthCheckController {

    @GetMapping
    @Operation(summary = "Health check endpoint", description = "Returns service health status.")
    public ResponseEntity<Map<String, String>> getHealth() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "HoneyChain Backend");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
}
