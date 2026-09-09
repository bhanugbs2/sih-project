package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import com.nexora.honeychain.dto.SensorReadingResponse;
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

@RestController
@RequestMapping("/api/sensors")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Sensor API", description = "Endpoint for ingesting telemetry sensor readings (ESP32 / IoT)")
public class SensorController {

    private final SensorReadingService sensorReadingService;

    public SensorController(SensorReadingService sensorReadingService) {
        this.sensorReadingService = sensorReadingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Record sensor telemetry reading", description = "Validates hive existence, stores telemetry values (supports nulls on sensor fault), and returns saved reading.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Sensor reading saved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or out-of-range sensor values"),
            @ApiResponse(responseCode = "404", description = "Hive not found")
    })
    public ResponseEntity<SensorReadingResponse> recordSensorReading(@Valid @RequestBody CreateSensorReadingRequest request) {
        SensorReadingResponse response = sensorReadingService.recordSensorReading(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

