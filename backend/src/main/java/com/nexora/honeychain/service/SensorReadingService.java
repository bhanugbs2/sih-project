package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import com.nexora.honeychain.dto.SensorReadingResponse;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.SensorReading;
import com.nexora.honeychain.repository.HiveRepository;
import com.nexora.honeychain.repository.SensorReadingRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SensorReadingService {

    private final SensorReadingRepository sensorReadingRepository;
    private final HiveRepository hiveRepository;
    private final AIAlertService aiAlertService;

    public SensorReadingService(SensorReadingRepository sensorReadingRepository, HiveRepository hiveRepository, AIAlertService aiAlertService) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.hiveRepository = hiveRepository;
        this.aiAlertService = aiAlertService;
    }

    @Transactional
    public SensorReadingResponse recordSensorReading(CreateSensorReadingRequest request) {
        Hive hive = hiveRepository.findByHiveId(request.getHiveId())
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + request.getHiveId()));

        SensorReading reading = DtoMapper.toSensorReadingEntity(request, hive);
        SensorReading saved = sensorReadingRepository.save(reading);

        if (aiAlertService != null) {
            aiAlertService.evaluateAndSaveTelemetryAlert(saved);
        }

        return DtoMapper.toSensorReadingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SensorReadingResponse> getHiveHistory(String hiveId, Long from, Long to, Integer limit) {
        Hive hive = hiveRepository.findByHiveId(hiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + hiveId));

        List<SensorReading> readings;
        if (from != null && to != null) {
            Instant fromInstant = from > 100000000000L ? Instant.ofEpochMilli(from) : Instant.ofEpochSecond(from);
            Instant toInstant = to > 100000000000L ? Instant.ofEpochMilli(to) : Instant.ofEpochSecond(to);
            readings = sensorReadingRepository.findByHiveHiveIdAndTimestampBetweenOrderByTimestampDesc(hive.getHiveId(), fromInstant, toInstant);
        } else if (limit != null && limit > 0) {
            readings = sensorReadingRepository.findByHiveHiveIdOrderByTimestampDesc(hive.getHiveId(), PageRequest.of(0, limit));
        } else {
            readings = sensorReadingRepository.findByHiveHiveIdOrderByTimestampDesc(hive.getHiveId());
        }

        return readings.stream()
                .map(DtoMapper::toSensorReadingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SensorReadingResponse getLatestReading(String hiveId) {
        Hive hive = hiveRepository.findByHiveId(hiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + hiveId));

        SensorReading reading = sensorReadingRepository.findFirstByHiveHiveIdOrderByTimestampDesc(hive.getHiveId())
                .orElseThrow(() -> new ResourceNotFoundException("No sensor readings available for hive: " + hiveId));

        return DtoMapper.toSensorReadingResponse(reading);
    }
}
