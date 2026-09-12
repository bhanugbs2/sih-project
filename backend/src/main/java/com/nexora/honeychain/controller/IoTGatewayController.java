package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.CreateGatewayRequest;
import com.nexora.honeychain.dto.FleetSummaryResponse;
import com.nexora.honeychain.dto.GatewayResponse;
import com.nexora.honeychain.service.IoTGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gateways")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "IoT Gateway Fleet API", description = "Endpoints for managing Raspberry Pi 5 Edge IoT Gateways and physical nodes")
public class IoTGatewayController {

    private final IoTGatewayService gatewayService;

    public IoTGatewayController(IoTGatewayService gatewayService) {
        this.gatewayService = gatewayService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get all IoT gateways in fleet")
    public ResponseEntity<List<GatewayResponse>> getAllGateways() {
        return ResponseEntity.ok(gatewayService.getAllGateways());
    }

    @GetMapping("/{gatewayId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get single gateway by ID")
    public ResponseEntity<GatewayResponse> getGatewayById(@PathVariable String gatewayId) {
        return ResponseEntity.ok(gatewayService.getGatewayById(gatewayId));
    }

    @GetMapping("/fleet-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get gateway fleet summary counts")
    public ResponseEntity<FleetSummaryResponse> getFleetSummary() {
        return ResponseEntity.ok(gatewayService.getFleetSummary());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Register or update an IoT gateway device")
    public ResponseEntity<GatewayResponse> registerGateway(@Valid @RequestBody CreateGatewayRequest request) {
        GatewayResponse response = gatewayService.registerOrUpdateGateway(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{gatewayId}/heartbeat")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER')")
    @Operation(summary = "Record heartbeat ping from Edge Gateway")
    public ResponseEntity<Void> recordHeartbeat(
            @PathVariable String gatewayId,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String powerStatus
    ) {
        gatewayService.recordHeartbeat(gatewayId, ipAddress, powerStatus);
        return ResponseEntity.noContent().build();
    }
}
