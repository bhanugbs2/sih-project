package com.nexora.honeychain.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class SystemStatusController {

    private final Instant startTime = Instant.now();

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("project", "HoneyChain");
        status.put("sihProblemStatement", "SIH26021");
        status.put("team", "Nexora");
        status.put("version", "1.0.0-phase1");
        status.put("status", "UP");
        status.put("serverTime", Instant.now().toString());
        status.put("uptimeSeconds", Instant.now().getEpochSecond() - startTime.getEpochSecond());
        
        Map<String, String> modules = new HashMap<>();
        modules.put("backend", "Spring Boot (Java 21)");
        modules.put("frontend", "React + TypeScript + Vite");
        modules.put("database", "PostgreSQL + Flyway");
        modules.put("iot", "ESP32 Sensor Telemetry");
        modules.put("blockchain", "EVM Adapter Architecture");
        modules.put("ai", "ONNX/DJL Honey Quality Engine");
        
        status.put("modules", modules);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getHealth() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "honeychain-backend");
        return ResponseEntity.ok(health);
    }
}
