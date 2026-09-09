package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CreateQualityTestRequest;
import com.nexora.honeychain.dto.QualityTestResponse;
import com.nexora.honeychain.service.QualityTestService;
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
@RequestMapping("/api/batches/{batchId}/quality-test")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Quality Test API", description = "Endpoints for recording and fetching quality laboratory inspection tests")
public class QualityTestController {

    private final QualityTestService qualityTestService;

    public QualityTestController(QualityTestService qualityTestService) {
        this.qualityTestService = qualityTestService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Add quality test result", description = "Records lab quality inspection results (moisture, pH, color, PASS/FAIL/REQUIRES_REVIEW) for a batch.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Quality test recorded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<QualityTestResponse> addQualityTest(
            @PathVariable String batchId,
            @Valid @RequestBody CreateQualityTestRequest request) {
        QualityTestResponse response = qualityTestService.addQualityTest(batchId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'QUALITY_INSPECTOR', 'BEEKEEPER')")
    @Operation(summary = "Get quality tests for batch", description = "Retrieves all quality test records for a specific batch.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Quality tests retrieved"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<List<QualityTestResponse>> getQualityTests(@PathVariable String batchId) {
        return ResponseEntity.ok(qualityTestService.getQualityTestsByBatchId(batchId));
    }
}
