package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreateFarmRequest;
import com.nexora.honeychain.dto.FarmResponse;
import com.nexora.honeychain.exception.ResourceAlreadyExistsException;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.Farm;
import com.nexora.honeychain.repository.FarmRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FarmService {

    private final FarmRepository farmRepository;

    public FarmService(FarmRepository farmRepository) {
        this.farmRepository = farmRepository;
    }

    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request) {
        if (farmRepository.findByFarmId(request.getFarmId()).isPresent()) {
            throw new ResourceAlreadyExistsException("Farm with farmId already exists: " + request.getFarmId());
        }
        Farm farm = DtoMapper.toFarmEntity(request);
        Farm saved = farmRepository.save(farm);
        return DtoMapper.toFarmResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FarmResponse> getAllFarms() {
        return farmRepository.findAll().stream()
                .map(DtoMapper::toFarmResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FarmResponse getFarmByFarmId(String farmId) {
        Farm farm = farmRepository.findByFarmId(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + farmId));
        return DtoMapper.toFarmResponse(farm);
    }

    @Transactional
    public FarmResponse updateFarm(String farmId, CreateFarmRequest request) {
        Farm farm = farmRepository.findByFarmId(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + farmId));
        farm.setName(request.getName());
        farm.setOwnerName(request.getOwnerName());
        farm.setLocation(request.getLocation());
        farm.setLatitude(request.getLatitude());
        farm.setLongitude(request.getLongitude());
        Farm updated = farmRepository.save(farm);
        return DtoMapper.toFarmResponse(updated);
    }

    @Transactional
    public void deleteFarm(String farmId) {
        Farm farm = farmRepository.findByFarmId(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + farmId));
        farmRepository.delete(farm);
    }
}
