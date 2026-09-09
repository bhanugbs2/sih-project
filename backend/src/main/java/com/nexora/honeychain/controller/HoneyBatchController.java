package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CreateHoneyBatchRequest;
import com.nexora.honeychain.dto.HoneyBatchResponse;
import com.nexora.honeychain.service.HoneyBatchService;
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
@RequestMapping("/api/batches")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Honey Batch API", description = "Endpoints for managing honey harvest batches and recalls")
public class HoneyBatchController {

    private final HoneyBatchService honeyBatchService;

    public HoneyBatchController(HoneyBatchService honeyBatchService) {
        this.honeyBatchService = honeyBatchService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Create honey batch", description = "Registers a new honey batch harvested from a hive.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Batch created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Hive not found"),
            @ApiResponse(responseCode = "409", description = "Batch ID already exists")
    })
    public ResponseEntity<HoneyBatchResponse> createBatch(@Valid @RequestBody CreateHoneyBatchRequest request) {
        HoneyBatchResponse response = honeyBatchService.createBatch(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get all honey batches", description = "Retrieves all registered honey harvest batches.")
    @ApiResponse(responseCode = "200", description = "Batches retrieved successfully")
    public ResponseEntity<List<HoneyBatchResponse>> getAllBatches() {
        return ResponseEntity.ok(honeyBatchService.getAllBatches());
    }

    @GetMapping("/{batchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get batch by ID", description = "Retrieves details of a specific honey batch by batchId.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Batch found"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<HoneyBatchResponse> getBatchById(@PathVariable String batchId) {
        return ResponseEntity.ok(honeyBatchService.getBatchByBatchId(batchId));
    }

    @PutMapping("/{batchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Update batch", description = "Updates details of an existing honey batch.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Batch updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Batch or Hive not found")
    })
    public ResponseEntity<HoneyBatchResponse> updateBatch(@PathVariable String batchId, @Valid @RequestBody CreateHoneyBatchRequest request) {
        return ResponseEntity.ok(honeyBatchService.updateBatch(batchId, request));
    }

    @PostMapping("/{batchId}/recall")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Recall honey batch", description = "Triggers emergency recall status for a honey batch.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Batch recalled successfully"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<HoneyBatchResponse> recallBatch(@PathVariable String batchId) {
        return ResponseEntity.ok(honeyBatchService.recallBatch(batchId));
    }
}

