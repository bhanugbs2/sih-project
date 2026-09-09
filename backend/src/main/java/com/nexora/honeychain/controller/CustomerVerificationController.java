package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CustomerVerificationResponse;
import com.nexora.honeychain.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verify")
@Tag(name = "Customer Verification API", description = "Public verification endpoint for consumers scanning product QR codes")
public class CustomerVerificationController {

    private final VerificationService verificationService;

    public CustomerVerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @GetMapping("/{packageId}")
    @Operation(summary = "Verify product package", description = "Aggregates complete supply chain lineage (Package, Batch, Hive, Farm, Quality Tests, Processing Records, Traceability Events) for consumer QR verification.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification lineage retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Package not found")
    })
    public ResponseEntity<CustomerVerificationResponse> verifyPackage(@PathVariable String packageId) {
        return ResponseEntity.ok(verificationService.verifyPackage(packageId));
    }
}
