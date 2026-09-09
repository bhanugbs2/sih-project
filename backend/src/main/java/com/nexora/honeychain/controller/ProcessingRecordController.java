package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CreateProcessingRecordRequest;
import com.nexora.honeychain.dto.HoneyBatchResponse;
import com.nexora.honeychain.dto.ProcessingRecordResponse;
import com.nexora.honeychain.service.ProcessingRecordService;
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
@RequestMapping("/api/batches/{batchId}/processing")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Processing API", description = "Endpoints for recording batch processing steps (filtration, pasteurization, packaging preparation)")
public class ProcessingRecordController {

    private final ProcessingRecordService processingRecordService;

    public ProcessingRecordController(ProcessingRecordService processingRecordService) {
        this.processingRecordService = processingRecordService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Add processing record", description = "Records a processing step performed on a honey batch.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Processing record added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or quality gate failure"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<ProcessingRecordResponse> addProcessingRecord(
            @PathVariable String batchId,
            @Valid @RequestBody CreateProcessingRecordRequest request) {
        ProcessingRecordResponse response = processingRecordService.addProcessingRecord(batchId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get processing records", description = "Retrieves processing steps for a specific honey batch.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Processing records retrieved"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<List<ProcessingRecordResponse>> getProcessingRecords(@PathVariable String batchId) {
        return ResponseEntity.ok(processingRecordService.getProcessingRecordsByBatchId(batchId));
    }

    @PostMapping("/ready-for-packaging")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Mark batch ready for packaging", description = "Transitions processed batch status to READY_FOR_PACKAGING.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Batch marked ready for packaging"),
            @ApiResponse(responseCode = "400", description = "Batch not in PROCESSED status"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<HoneyBatchResponse> markReadyForPackaging(@PathVariable String batchId) {
        return ResponseEntity.ok(processingRecordService.markBatchReadyForPackaging(batchId));
    }
}
