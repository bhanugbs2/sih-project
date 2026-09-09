package com.nexora.honeychain.controller;

import com.nexora.honeychain.blockchain.BlockchainProperties;
import com.nexora.honeychain.blockchain.BlockchainService;
import com.nexora.honeychain.dto.TraceabilityEventResponse;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.TraceabilityEvent;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
import com.nexora.honeychain.service.TraceabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blockchain")
@Tag(name = "Blockchain Ledger", description = "Endpoints for EVM smart contract traceability event anchoring and proof verification")
public class BlockchainController {

    private final BlockchainService blockchainService;
    private final TraceabilityService traceabilityService;
    private final TraceabilityEventRepository traceabilityEventRepository;
    private final BlockchainProperties properties;

    public BlockchainController(BlockchainService blockchainService,
                                TraceabilityService traceabilityService,
                                TraceabilityEventRepository traceabilityEventRepository,
                                BlockchainProperties properties) {
        this.blockchainService = blockchainService;
        this.traceabilityService = traceabilityService;
        this.traceabilityEventRepository = traceabilityEventRepository;
        this.properties = properties;
    }

    @PostMapping("/anchor/{eventId}")
    @PreAuthorize("hasAnyRole('BEEKEEPER', 'QUALITY_INSPECTOR', 'ADMIN')")
    @Operation(summary = "Anchor Traceability Event", description = "Submits canonical SHA-256 event hash to EVM smart contract and records on-chain transaction hash")
    public ResponseEntity<TraceabilityEventResponse> anchorEvent(@PathVariable String eventId) {
        TraceabilityEvent updatedEvent = blockchainService.anchorEvent(eventId);
        return ResponseEntity.ok(DtoMapper.toTraceabilityEventResponse(updatedEvent));
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get Blockchain Status by Event ID", description = "Retrieves blockchain anchoring proof, transaction hash, and status for a specific event")
    public ResponseEntity<TraceabilityEventResponse> getEventBlockchainStatus(@PathVariable String eventId) {
        TraceabilityEvent event = traceabilityEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Traceability event not found: " + eventId));
        return ResponseEntity.ok(DtoMapper.toTraceabilityEventResponse(event));
    }

    @GetMapping("/batch/{batchId}")
    @Operation(summary = "Get Batch Blockchain Traceability Chain", description = "Retrieves full chronological timeline of traceability events and blockchain anchoring statuses for a batch")
    public ResponseEntity<List<TraceabilityEventResponse>> getBatchBlockchainTraceability(@PathVariable String batchId) {
        return ResponseEntity.ok(traceabilityService.getTraceabilityByBatchId(batchId));
    }

    @GetMapping("/status")
    @Operation(summary = "Get Blockchain Node Configuration Status", description = "Returns active EVM RPC configuration status and contract address details")
    public ResponseEntity<Map<String, Object>> getBlockchainConfigurationStatus() {
        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("enabled", properties.isEnabled());
        statusMap.put("configured", properties.isConfigured());
        statusMap.put("networkName", properties.getNetworkName());
        statusMap.put("chainId", properties.getChainId());
        statusMap.put("contractAddress", properties.getContractAddress().isEmpty() ? "NOT_DEPLOYED" : properties.getContractAddress());
        statusMap.put("rpcUrl", properties.getRpcUrl().isEmpty() ? "UNCONFIGURED" : properties.getRpcUrl());
        return ResponseEntity.ok(statusMap);
    }
}
