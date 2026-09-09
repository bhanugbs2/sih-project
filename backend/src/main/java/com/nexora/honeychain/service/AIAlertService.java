package com.nexora.honeychain.service;

import com.nexora.honeychain.ai.HiveAnomalyDetector;
import com.nexora.honeychain.dto.AIAlertResponse;
import com.nexora.honeychain.dto.AIStatusResponse;
import com.nexora.honeychain.dto.ai.TelemetryAnalysisResponse;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.AIAlert;
import com.nexora.honeychain.model.Hive;
import com.nexora.honeychain.model.SensorReading;
import com.nexora.honeychain.model.enums.AIAlertStatus;
import com.nexora.honeychain.repository.AIAlertRepository;
import com.nexora.honeychain.repository.HiveRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AIAlertService {

    private final AIAlertRepository aiAlertRepository;
    private final HiveRepository hiveRepository;
    private final HiveAnomalyDetector anomalyDetector;

    public AIAlertService(AIAlertRepository aiAlertRepository, HiveRepository hiveRepository, HiveAnomalyDetector anomalyDetector) {
        this.aiAlertRepository = aiAlertRepository;
        this.hiveRepository = hiveRepository;
        this.anomalyDetector = anomalyDetector;
    }

    @Transactional
    public void evaluateAndSaveTelemetryAlert(SensorReading reading) {
        if (reading == null || reading.getHive() == null) return;
        TelemetryAnalysisResponse analysis = anomalyDetector.analyzeSensorReading(reading);
        if (analysis != null && (analysis.getAlertStatus() != AIAlertStatus.NORMAL || analysis.getRiskScore() > 0)) {
            String factors = String.join(", ", analysis.getAnomalyFactors());
            AIAlert alert = new AIAlert(
                    reading.getHive(),
                    analysis.getRiskScore(),
                    analysis.getAlertStatus(),
                    analysis.getMessage(),
                    factors,
                    reading.getTimestamp() != null ? reading.getTimestamp() : Instant.now()
            );
            aiAlertRepository.save(alert);
        }
    }

    @Transactional(readOnly = true)
    public List<AIAlertResponse> getAllSystemAlerts() {
        return aiAlertRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(DtoMapper::toAIAlertResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AIStatusResponse getAIStatus(String hiveId) {
        Hive hive = hiveRepository.findByHiveId(hiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + hiveId));

        Optional<AIAlert> latestAlert = aiAlertRepository.findFirstByHiveHiveIdOrderByTimestampDesc(hive.getHiveId());

        if (latestAlert.isPresent()) {
            AIAlert alert = latestAlert.get();
            List<String> factorsList = new ArrayList<>();
            if (alert.getFactors() != null && !alert.getFactors().isBlank()) {
                factorsList = Arrays.asList(alert.getFactors().split(",\\s*"));
            }
            return new AIStatusResponse(
                    hive.getHiveId(),
                    alert.getRiskScore(),
                    alert.getStatus().name(),
                    alert.getMessage(),
                    factorsList
            );
        }

        return new AIStatusResponse(
                hive.getHiveId(),
                0.0,
                "NORMAL",
                "No AI alert available yet.",
                new ArrayList<>()
        );
    }

    @Transactional(readOnly = true)
    public List<AIAlertResponse> getHiveAlerts(String hiveId, Integer limit) {
        Hive hive = hiveRepository.findByHiveId(hiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Hive not found: " + hiveId));

        List<AIAlert> alerts;
        if (limit != null && limit > 0) {
            alerts = aiAlertRepository.findByHiveHiveIdOrderByTimestampDesc(hive.getHiveId(), PageRequest.of(0, limit));
        } else {
            alerts = aiAlertRepository.findByHiveHiveIdOrderByTimestampDesc(hive.getHiveId());
        }

        return alerts.stream()
                .map(DtoMapper::toAIAlertResponse)
                .collect(Collectors.toList());
    }
}

