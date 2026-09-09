package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.TraceabilityEventResponse;
import com.nexora.honeychain.service.TraceabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Traceability API", description = "Read-only endpoints for querying chronological supply chain traceability events")
public class TraceabilityController {

    private final TraceabilityService traceabilityService;

    public TraceabilityController(TraceabilityService traceabilityService) {
        this.traceabilityService = traceabilityService;
    }

    @GetMapping("/batches/{batchId}/traceability")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get batch traceability events", description = "Retrieves supply chain traceability events for a batch ordered chronologically.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Traceability events retrieved"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<List<TraceabilityEventResponse>> getBatchTraceability(@PathVariable String batchId) {
        return ResponseEntity.ok(traceabilityService.getTraceabilityByBatchId(batchId));
    }

    @GetMapping("/packages/{packageId}/traceability")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get package traceability events", description = "Retrieves supply chain traceability events for a package ordered chronologically.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Traceability events retrieved"),
            @ApiResponse(responseCode = "404", description = "Package not found")
    })
    public ResponseEntity<List<TraceabilityEventResponse>> getPackageTraceability(@PathVariable String packageId) {
        return ResponseEntity.ok(traceabilityService.getTraceabilityByPackageId(packageId));
    }
}

