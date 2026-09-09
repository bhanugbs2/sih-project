package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.*;
import com.nexora.honeychain.service.AIAlertService;
import com.nexora.honeychain.service.HiveService;
import com.nexora.honeychain.service.SensorReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hives")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Hive API", description = "Endpoints for managing hives, sensor history, latest reading, and AI alerts")
public class HiveController {

    private final HiveService hiveService;
    private final SensorReadingService sensorReadingService;
    private final AIAlertService aiAlertService;

    public HiveController(HiveService hiveService, SensorReadingService sensorReadingService, AIAlertService aiAlertService) {
        this.hiveService = hiveService;
        this.sensorReadingService = sensorReadingService;
        this.aiAlertService = aiAlertService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new hive", description = "Creates a new hive under an existing farm.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Hive created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Farm not found"),
            @ApiResponse(responseCode = "409", description = "Hive ID already exists")
    })
    public ResponseEntity<HiveResponse> createHive(@Valid @RequestBody CreateHiveRequest request) {
        HiveResponse response = hiveService.createHive(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get hives", description = "Retrieves all hives, optionally filtered by farmId.")
    @ApiResponse(responseCode = "200", description = "Hives retrieved successfully")
    public ResponseEntity<List<HiveResponse>> getHives(@RequestParam(required = false) String farmId) {
        return ResponseEntity.ok(hiveService.getAllHives(farmId));
    }

    @GetMapping("/{hiveId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get hive by ID", description = "Retrieves details of a specific hive by hiveId.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Hive found"),
            @ApiResponse(responseCode = "404", description = "Hive not found")
    })
    public ResponseEntity<HiveResponse> getHiveById(@PathVariable String hiveId) {
        return ResponseEntity.ok(hiveService.getHiveByHiveId(hiveId));
    }

    @PutMapping("/{hiveId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update hive", description = "Updates details of an existing hive.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Hive updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Hive or Farm not found")
    })
    public ResponseEntity<HiveResponse> updateHive(@PathVariable String hiveId, @Valid @RequestBody CreateHiveRequest request) {
        return ResponseEntity.ok(hiveService.updateHive(hiveId, request));
    }

    @DeleteMapping("/{hiveId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete hive", description = "Deletes a hive by hiveId.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Hive deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Hive not found")
    })
    public ResponseEntity<Void> deleteHive(@PathVariable String hiveId) {
        hiveService.deleteHive(hiveId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{hiveId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get hive sensor history", description = "Returns historical telemetry sensor readings ordered newest first.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "History retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Hive not found")
    })
    public ResponseEntity<List<SensorReadingResponse>> getHiveHistory(
            @PathVariable String hiveId,
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to,
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(sensorReadingService.getHiveHistory(hiveId, from, to, limit));
    }

    @GetMapping("/{hiveId}/latest")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get latest sensor reading", description = "Returns the latest available sensor reading for a hive.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Latest reading retrieved"),
            @ApiResponse(responseCode = "404", description = "Hive or sensor reading not found")
    })
    public ResponseEntity<SensorReadingResponse> getLatestReading(@PathVariable String hiveId) {
        return ResponseEntity.ok(sensorReadingService.getLatestReading(hiveId));
    }

    @GetMapping("/{hiveId}/ai-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get AI status foundation", description = "Returns the latest AI analysis status or default foundation response.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "AI status retrieved"),
            @ApiResponse(responseCode = "404", description = "Hive not found")
    })
    public ResponseEntity<AIStatusResponse> getAIStatus(@PathVariable String hiveId) {
        return ResponseEntity.ok(aiAlertService.getAIStatus(hiveId));
    }

    @GetMapping("/{hiveId}/alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get AI alerts history", description = "Returns AI alerts for a hive ordered newest first.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Alerts retrieved"),
            @ApiResponse(responseCode = "404", description = "Hive not found")
    })
    public ResponseEntity<List<AIAlertResponse>> getHiveAlerts(
            @PathVariable String hiveId,
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(aiAlertService.getHiveAlerts(hiveId, limit));
    }
}

