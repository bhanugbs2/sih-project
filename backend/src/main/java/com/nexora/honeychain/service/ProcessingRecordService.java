package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreateProcessingRecordRequest;
import com.nexora.honeychain.dto.HoneyBatchResponse;
import com.nexora.honeychain.dto.ProcessingRecordResponse;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.ProcessingRecord;
import com.nexora.honeychain.model.TraceabilityEvent;
import com.nexora.honeychain.model.enums.BlockchainEnvironment;
import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import com.nexora.honeychain.model.enums.TraceabilityEventType;
import com.nexora.honeychain.repository.HoneyBatchRepository;
import com.nexora.honeychain.repository.ProcessingRecordRepository;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProcessingRecordService {

    private static final List<String> VALID_OPERATIONS = Arrays.asList(
            "EXTRACTION", "FILTRATION", "PASTEURIZATION", "PACKAGING_PREPARATION",
            "COLD EXTRACTION", "MICRO-FILTRATION", "SETTLING", "DECRYSTALLIZATION"
    );

    private final ProcessingRecordRepository processingRecordRepository;
    private final HoneyBatchRepository honeyBatchRepository;
    private final TraceabilityEventRepository traceabilityEventRepository;

    public ProcessingRecordService(ProcessingRecordRepository processingRecordRepository,
                                   HoneyBatchRepository honeyBatchRepository,
                                   TraceabilityEventRepository traceabilityEventRepository) {
        this.processingRecordRepository = processingRecordRepository;
        this.honeyBatchRepository = honeyBatchRepository;
        this.traceabilityEventRepository = traceabilityEventRepository;
    }

    @Transactional
    public ProcessingRecordResponse addProcessingRecord(String batchId, CreateProcessingRecordRequest request) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        // Quality Gate Check: Processing is blocked if batch has not passed quality testing or is under review
        if (batch.getStatus() == HoneyBatchStatus.HARVESTED) {
            throw new IllegalStateException("Processing blocked: Quality testing has not been performed for batch " + batchId);
        }
        if (batch.getStatus() == HoneyBatchStatus.REQUIRES_REVIEW || batch.getStatus() == HoneyBatchStatus.RECALLED) {
            throw new IllegalStateException("Processing blocked: Batch " + batchId + " is under review or recalled.");
        }

        // Validate operation
        String operation = request.getOperation() != null ? request.getOperation() : request.getProcessType();
        if (operation == null || operation.isBlank()) {
            throw new IllegalArgumentException("Processing operation is required");
        }

        // Validate timestamps
        if (request.getStartedAt() != null && request.getCompletedAt() != null) {
            if (request.getCompletedAt().isBefore(request.getStartedAt())) {
                throw new IllegalArgumentException("Processing completion time cannot be before start time");
            }
        }

        ProcessingRecord record = DtoMapper.toProcessingRecordEntity(request, batch);
        ProcessingRecord savedRecord = processingRecordRepository.save(record);

        // Update batch status to PROCESSING or PROCESSED / READY_FOR_PACKAGING
        List<ProcessingRecord> allRecords = processingRecordRepository.findByBatchBatchId(batch.getBatchId());
        if (allRecords.size() >= 1) {
            batch.setStatus(HoneyBatchStatus.PROCESSED);
        } else {
            batch.setStatus(HoneyBatchStatus.PROCESSING);
        }
        honeyBatchRepository.save(batch);

        // Record PROCESSED Traceability Event
        TraceabilityEvent event = new TraceabilityEvent(
                batch,
                null,
                TraceabilityEventType.PROCESSED,
                "HASH-PROCESS-" + savedRecord.getOperation() + "-" + savedRecord.getId(),
                Instant.now(),
                "PENDING",
                BlockchainEnvironment.DEVELOPMENT
        );
        traceabilityEventRepository.save(event);

        return DtoMapper.toProcessingRecordResponse(savedRecord);
    }

    @Transactional
    public HoneyBatchResponse markBatchReadyForPackaging(String batchId) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        if (batch.getStatus() != HoneyBatchStatus.PROCESSED && batch.getStatus() != HoneyBatchStatus.PROCESSING) {
            throw new IllegalStateException("Batch must be PROCESSED before marking READY_FOR_PACKAGING.");
        }

        batch.setStatus(HoneyBatchStatus.READY_FOR_PACKAGING);
        HoneyBatch updated = honeyBatchRepository.save(batch);

        TraceabilityEvent event = new TraceabilityEvent(
                updated,
                null,
                TraceabilityEventType.READY_FOR_PACKAGING,
                "HASH-READY-FOR-PACKAGING-" + updated.getBatchId(),
                Instant.now(),
                "PENDING",
                BlockchainEnvironment.DEVELOPMENT
        );
        traceabilityEventRepository.save(event);

        return DtoMapper.toHoneyBatchResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<ProcessingRecordResponse> getProcessingRecordsByBatchId(String batchId) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        return processingRecordRepository.findByBatchBatchId(batch.getBatchId()).stream()
                .map(DtoMapper::toProcessingRecordResponse)
                .collect(Collectors.toList());
    }
}
