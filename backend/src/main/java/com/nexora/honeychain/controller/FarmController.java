package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CreateFarmRequest;
import com.nexora.honeychain.dto.FarmResponse;
import com.nexora.honeychain.service.FarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Farm API", description = "Endpoints for managing beekeeping farms")
public class FarmController {

    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new farm", description = "Registers a new farm with a unique farmId.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Farm created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "409", description = "Farm ID already exists")
    })
    public ResponseEntity<FarmResponse> createFarm(@Valid @RequestBody CreateFarmRequest request) {
        FarmResponse response = farmService.createFarm(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Get all farms", description = "Retrieves a list of all registered farms.")
    @ApiResponse(responseCode = "200", description = "Farms retrieved successfully")
    public ResponseEntity<List<FarmResponse>> getAllFarms() {
        return ResponseEntity.ok(farmService.getAllFarms());
    }

    @GetMapping("/{farmId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Get farm by ID", description = "Retrieves details of a specific farm by farmId.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Farm found"),
            @ApiResponse(responseCode = "404", description = "Farm not found")
    })
    public ResponseEntity<FarmResponse> getFarmById(@PathVariable String farmId) {
        return ResponseEntity.ok(farmService.getFarmByFarmId(farmId));
    }

    @PutMapping("/{farmId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update farm", description = "Updates an existing farm's details.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Farm updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Farm not found")
    })
    public ResponseEntity<FarmResponse> updateFarm(@PathVariable String farmId, @Valid @RequestBody CreateFarmRequest request) {
        return ResponseEntity.ok(farmService.updateFarm(farmId, request));
    }

    @DeleteMapping("/{farmId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete farm", description = "Deletes a farm by farmId.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Farm deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Farm not found")
    })
    public ResponseEntity<Void> deleteFarm(@PathVariable String farmId) {
        farmService.deleteFarm(farmId);
        return ResponseEntity.noContent().build();
    }
}
