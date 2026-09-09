package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CreatePackageRequest;
import com.nexora.honeychain.dto.PackageResponse;
import com.nexora.honeychain.service.PackageService;
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
@RequestMapping("/api/packages")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Package API", description = "Endpoints for creating and retrieving retail honey packages")
public class PackageController {

    private final PackageService packageService;

    public PackageController(PackageService packageService) {
        this.packageService = packageService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create consumer package", description = "Creates a unique retail package linked to a honey batch.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Package created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Batch not found"),
            @ApiResponse(responseCode = "409", description = "Package ID already exists")
    })
    public ResponseEntity<PackageResponse> createPackage(@Valid @RequestBody CreatePackageRequest request) {
        PackageResponse response = packageService.createPackage(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{packageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Get package by ID", description = "Retrieves retail package information by packageId.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Package found"),
            @ApiResponse(responseCode = "404", description = "Package not found")
    })
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable String packageId) {
        return ResponseEntity.ok(packageService.getPackageByPackageId(packageId));
    }
}

