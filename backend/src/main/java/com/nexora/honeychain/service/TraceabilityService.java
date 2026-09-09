package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.TraceabilityEventResponse;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.repository.HoneyBatchRepository;
import com.nexora.honeychain.repository.PackageRepository;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TraceabilityService {

    private final TraceabilityEventRepository traceabilityEventRepository;
    private final HoneyBatchRepository honeyBatchRepository;
    private final PackageRepository packageRepository;

    public TraceabilityService(TraceabilityEventRepository traceabilityEventRepository, HoneyBatchRepository honeyBatchRepository, PackageRepository packageRepository) {
        this.traceabilityEventRepository = traceabilityEventRepository;
        this.honeyBatchRepository = honeyBatchRepository;
        this.packageRepository = packageRepository;
    }

    @Transactional(readOnly = true)
    public List<TraceabilityEventResponse> getTraceabilityByBatchId(String batchId) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        return traceabilityEventRepository.findByBatchBatchIdOrderByTimestampAsc(batch.getBatchId()).stream()
                .map(DtoMapper::toTraceabilityEventResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TraceabilityEventResponse> getTraceabilityByPackageId(String packageId) {
        Package pkg = packageRepository.findByPackageId(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found: " + packageId));

        return traceabilityEventRepository.findByPackageEntityPackageIdOrderByTimestampAsc(pkg.getPackageId()).stream()
                .map(DtoMapper::toTraceabilityEventResponse)
                .collect(Collectors.toList());
    }
}
