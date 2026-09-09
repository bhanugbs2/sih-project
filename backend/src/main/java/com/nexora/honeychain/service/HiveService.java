package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreateHiveRequest;
import com.nexora.honeychain.dto.HiveResponse;
import com.nexora.honeychain.exception.ResourceAlreadyExistsException;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.repository.FarmRepository;
import com.nexora.honeychain.repository.HiveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HiveService {

    private final HiveRepository hiveRepository;
    private final FarmRepository farmRepository;

    public HiveService(HiveRepository hiveRepository, FarmRepository farmRepository) {
        this.hiveRepository = hiveRepository;
        this.farmRepository = farmRepository;
    }

    @Transactional
    public HiveResponse createHive(CreateHiveRequest request) {
        Farm farm = farmRepository.findByFarmId(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with farmId: " + request.getFarmId()));

        if (hiveRepository.findByHiveId(request.getHiveId()).isPresent()) {
            throw new ResourceAlreadyExistsException("Hive with hiveId already exists: " + request.getHiveId());
        }

        Hive hive = DtoMapper.toHiveEntity(request, farm);
        Hive saved = hiveRepository.save(hive);
        return DtoMapper.toHiveResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<HiveResponse> getAllHives(String farmId) {
        List<Hive> hives;
        if (farmId != null && !farmId.isBlank()) {
            hives = hiveRepository.findByFarmFarmId(farmId);
        } else {
            hives = hiveRepository.findAll();
        }
        return hives.stream()
                .map(DtoMapper::toHiveResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HiveResponse getHiveByHiveId(String hiveId) {
        Hive hive = hiveRepository.findByHiveId(hiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + hiveId));
        return DtoMapper.toHiveResponse(hive);
    }

    @Transactional
    public HiveResponse updateHive(String hiveId, CreateHiveRequest request) {
        Hive hive = hiveRepository.findByHiveId(hiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + hiveId));

        if (!hive.getFarm().getFarmId().equals(request.getFarmId())) {
            Farm newFarm = farmRepository.findByFarmId(request.getFarmId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farm not found with farmId: " + request.getFarmId()));
            hive.setFarm(newFarm);
        }

        hive.setName(request.getName());
        hive.setLocation(request.getLocation());
        hive.setLatitude(request.getLatitude());
        hive.setLongitude(request.getLongitude());
        if (request.getStatus() != null) {
            hive.setStatus(request.getStatus());
        }
        Hive updated = hiveRepository.save(hive);
        return DtoMapper.toHiveResponse(updated);
    }

    @Transactional
    public void deleteHive(String hiveId) {
        Hive hive = hiveRepository.findByHiveId(hiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + hiveId));
        hiveRepository.delete(hive);
    }
}
