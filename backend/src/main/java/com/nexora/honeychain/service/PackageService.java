package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreatePackageRequest;
import com.nexora.honeychain.dto.PackageResponse;
import com.nexora.honeychain.exception.ResourceAlreadyExistsException;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.model.TraceabilityEvent;
import com.nexora.honeychain.model.enums.BlockchainEnvironment;
import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import com.nexora.honeychain.model.enums.TraceabilityEventType;
import com.nexora.honeychain.repository.HoneyBatchRepository;
import com.nexora.honeychain.repository.PackageRepository;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
public class PackageService {

    private final PackageRepository packageRepository;
    private final HoneyBatchRepository honeyBatchRepository;
    private final TraceabilityEventRepository traceabilityEventRepository;

    public PackageService(PackageRepository packageRepository, HoneyBatchRepository honeyBatchRepository, TraceabilityEventRepository traceabilityEventRepository) {
        this.packageRepository = packageRepository;
        this.honeyBatchRepository = honeyBatchRepository;
        this.traceabilityEventRepository = traceabilityEventRepository;
    }

    @Transactional
    public PackageResponse createPackage(CreatePackageRequest request) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + request.getBatchId()));

        if (packageRepository.findByPackageId(request.getPackageId()).isPresent()) {
            throw new ResourceAlreadyExistsException("Package with packageId already exists: " + request.getPackageId());
        }

        Package pkg = DtoMapper.toPackageEntity(request, batch);
        Package savedPkg = packageRepository.save(pkg);

        batch.setStatus(HoneyBatchStatus.PACKAGED);
        honeyBatchRepository.save(batch);

        // Record PACKAGED Traceability Event
        TraceabilityEvent event = new TraceabilityEvent(
                batch,
                savedPkg,
                TraceabilityEventType.PACKAGED,
                "HASH-PKG-" + savedPkg.getPackageId(),
                Instant.now(),
                "PENDING",
                BlockchainEnvironment.DEVELOPMENT
        );
        traceabilityEventRepository.save(event);

        return DtoMapper.toPackageResponse(savedPkg);
    }

    @Transactional(readOnly = true)
    public PackageResponse getPackageByPackageId(String packageId) {
        Package pkg = packageRepository.findByPackageId(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found: " + packageId));
        return DtoMapper.toPackageResponse(pkg);
    }
}
