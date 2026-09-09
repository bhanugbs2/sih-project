package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreateHoneyBatchRequest;
import com.nexora.honeychain.dto.HoneyBatchResponse;
import com.nexora.honeychain.exception.ResourceAlreadyExistsException;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.TraceabilityEvent;
import com.nexora.honeychain.model.enums.BlockchainEnvironment;
import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import com.nexora.honeychain.model.enums.TraceabilityEventType;
import com.nexora.honeychain.repository.HiveRepository;
import com.nexora.honeychain.repository.HoneyBatchRepository;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HoneyBatchService {

    private final HoneyBatchRepository honeyBatchRepository;
    private final HiveRepository hiveRepository;
    private final TraceabilityEventRepository traceabilityEventRepository;

    public HoneyBatchService(HoneyBatchRepository honeyBatchRepository, HiveRepository hiveRepository, TraceabilityEventRepository traceabilityEventRepository) {
        this.honeyBatchRepository = honeyBatchRepository;
        this.hiveRepository = hiveRepository;
        this.traceabilityEventRepository = traceabilityEventRepository;
    }

    @Transactional
    public HoneyBatchResponse createBatch(CreateHoneyBatchRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Harvest quantity must be greater than zero");
        }

        Hive hive = hiveRepository.findByHiveId(request.getHiveId())
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + request.getHiveId()));

        if (honeyBatchRepository.findByBatchId(request.getBatchId()).isPresent()) {
            throw new ResourceAlreadyExistsException("Batch with batchId already exists: " + request.getBatchId());
        }

        HoneyBatch batch = DtoMapper.toHoneyBatchEntity(request, hive);
        HoneyBatch savedBatch = honeyBatchRepository.save(batch);

        // Record HARVESTED Traceability Event
        TraceabilityEvent event = new TraceabilityEvent(
                savedBatch,
                null,
                TraceabilityEventType.HARVESTED,
                "HASH-HARVEST-" + savedBatch.getBatchId(),
                Instant.now(),
                "PENDING",
                BlockchainEnvironment.DEVELOPMENT
        );
        traceabilityEventRepository.save(event);

        return DtoMapper.toHoneyBatchResponse(savedBatch);
    }

    @Transactional(readOnly = true)
    public List<HoneyBatchResponse> getAllBatches() {
        return honeyBatchRepository.findAll().stream()
                .map(DtoMapper::toHoneyBatchResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HoneyBatchResponse getBatchByBatchId(String batchId) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));
        return DtoMapper.toHoneyBatchResponse(batch);
    }

    @Transactional
    public HoneyBatchResponse updateBatch(String batchId, CreateHoneyBatchRequest request) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        if (!batch.getHive().getHiveId().equals(request.getHiveId())) {
            Hive newHive = hiveRepository.findByHiveId(request.getHiveId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + request.getHiveId()));
            batch.setHive(newHive);
        }

        if (request.getQuantity() != null) {
            if (request.getQuantity() <= 0) {
                throw new IllegalArgumentException("Harvest quantity must be greater than zero");
            }
            batch.setQuantity(request.getQuantity());
        }

        batch.setHarvestDate(request.getHarvestDate());
        batch.setUnit(request.getUnit());
        if (request.getHarvestNotes() != null) {
            batch.setHarvestNotes(request.getHarvestNotes());
        }

        if (request.getStatus() != null && request.getStatus() != batch.getStatus()) {
            validateStatusTransition(batch.getStatus(), request.getStatus());
            batch.setStatus(request.getStatus());
        }

        HoneyBatch updated = honeyBatchRepository.save(batch);
        return DtoMapper.toHoneyBatchResponse(updated);
    }

    @Transactional
    public HoneyBatchResponse updateBatchStatus(String batchId, HoneyBatchStatus newStatus) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        validateStatusTransition(batch.getStatus(), newStatus);
        batch.setStatus(newStatus);
        HoneyBatch updated = honeyBatchRepository.save(batch);
        return DtoMapper.toHoneyBatchResponse(updated);
    }

    @Transactional
    public HoneyBatchResponse recallBatch(String batchId) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        batch.setStatus(HoneyBatchStatus.RECALLED);
        HoneyBatch updated = honeyBatchRepository.save(batch);

        // Record RECALLED Traceability Event
        TraceabilityEvent event = new TraceabilityEvent(
                updated,
                null,
                TraceabilityEventType.VERIFIED,
                "HASH-RECALLED-" + updated.getBatchId(),
                Instant.now(),
                "PENDING",
                BlockchainEnvironment.DEVELOPMENT
        );
        traceabilityEventRepository.save(event);

        return DtoMapper.toHoneyBatchResponse(updated);
    }

    private void validateStatusTransition(HoneyBatchStatus current, HoneyBatchStatus target) {
        if (target == HoneyBatchStatus.RECALLED) {
            return; // Recall is allowed from any status
        }
        if (current == HoneyBatchStatus.HARVESTED && target == HoneyBatchStatus.PROCESSED) {
            throw new IllegalStateException("Invalid transition: Cannot move directly from HARVESTED to PROCESSED without quality testing.");
        }
        if (current == HoneyBatchStatus.HARVESTED && target == HoneyBatchStatus.READY_FOR_PACKAGING) {
            throw new IllegalStateException("Invalid transition: Cannot move directly from HARVESTED to READY_FOR_PACKAGING.");
        }
        if (current == HoneyBatchStatus.REQUIRES_REVIEW && target == HoneyBatchStatus.PROCESSED) {
            throw new IllegalStateException("Invalid transition: Batch under review cannot enter PROCESSED state.");
        }
    }
}
