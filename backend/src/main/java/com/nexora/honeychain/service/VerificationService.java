package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.*;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VerificationService {

    private final PackageRepository packageRepository;
    private final HoneyBatchRepository honeyBatchRepository;
    private final QualityTestRepository qualityTestRepository;
    private final ProcessingRecordRepository processingRecordRepository;
    private final TraceabilityEventRepository traceabilityEventRepository;

    public VerificationService(PackageRepository packageRepository,
                               HoneyBatchRepository honeyBatchRepository,
                               QualityTestRepository qualityTestRepository,
                               ProcessingRecordRepository processingRecordRepository,
                               TraceabilityEventRepository traceabilityEventRepository) {
        this.packageRepository = packageRepository;
        this.honeyBatchRepository = honeyBatchRepository;
        this.qualityTestRepository = qualityTestRepository;
        this.processingRecordRepository = processingRecordRepository;
        this.traceabilityEventRepository = traceabilityEventRepository;
    }

    @Transactional(readOnly = true)
    public CustomerVerificationResponse verifyPackage(String packageId) {
        Package pkg = packageRepository.findByPackageId(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found: " + packageId));

        HoneyBatch batch = pkg.getBatch();
        Hive hive = batch != null ? batch.getHive() : null;
        Farm farm = hive != null ? hive.getFarm() : null;

        PackageResponse packageResponse = DtoMapper.toPackageResponse(pkg);
        HoneyBatchResponse batchResponse = DtoMapper.toHoneyBatchResponse(batch);
        HiveResponse hiveResponse = DtoMapper.toHiveResponse(hive);
        FarmResponse farmResponse = DtoMapper.toFarmResponse(farm);

        List<QualityTestResponse> qualityTests = batch != null ?
                qualityTestRepository.findByBatchBatchId(batch.getBatchId()).stream()
                        .map(DtoMapper::toQualityTestResponse)
                        .collect(Collectors.toList()) : List.of();

        List<ProcessingRecordResponse> processingRecords = batch != null ?
                processingRecordRepository.findByBatchBatchId(batch.getBatchId()).stream()
                        .map(DtoMapper::toProcessingRecordResponse)
                        .collect(Collectors.toList()) : List.of();

        List<TraceabilityEventResponse> traceabilityEvents = traceabilityEventRepository
                .findByPackageEntityPackageIdOrderByTimestampAsc(pkg.getPackageId()).stream()
                .map(DtoMapper::toTraceabilityEventResponse)
                .collect(Collectors.toList());

        if (batch != null) {
            List<TraceabilityEventResponse> batchEvents = traceabilityEventRepository
                    .findByBatchBatchIdOrderByTimestampAsc(batch.getBatchId()).stream()
                    .map(DtoMapper::toTraceabilityEventResponse)
                    .filter(bEvt -> traceabilityEvents.stream().noneMatch(pEvt -> pEvt.getId().equals(bEvt.getId())))
                    .collect(Collectors.toList());
            traceabilityEvents.addAll(batchEvents);
            traceabilityEvents.sort(java.util.Comparator.comparing(TraceabilityEventResponse::getTimestamp));
        }

        String verificationStatus = "PENDING";
        if (traceabilityEvents != null && !traceabilityEvents.isEmpty()) {
            boolean anyAnchored = traceabilityEvents.stream()
                    .anyMatch(e -> e.getBlockchainStatus() != null && "BLOCKCHAIN_ANCHORED".equalsIgnoreCase(e.getBlockchainStatus().name()));
            if (anyAnchored) {
                verificationStatus = "VERIFIED";
            }
        }

        return new CustomerVerificationResponse(
                packageResponse,
                batchResponse,
                hiveResponse,
                farmResponse,
                qualityTests,
                processingRecords,
                traceabilityEvents,
                verificationStatus
        );
    }
}
