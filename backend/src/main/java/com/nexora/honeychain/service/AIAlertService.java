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
import com.nexora.honeychain.service.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AIAlertService {

    private static final Duration DEDUPLICATION_COOLDOWN = Duration.ofMinutes(15);

    private final AIAlertRepository aiAlertRepository;
    private final HiveRepository hiveRepository;
    private final HiveAnomalyDetector anomalyDetector;
    private final NotificationService notificationService;

    @Autowired
    public AIAlertService(
            AIAlertRepository aiAlertRepository,
            HiveRepository hiveRepository,
            HiveAnomalyDetector anomalyDetector,
            NotificationService notificationService
    ) {
        this.aiAlertRepository = aiAlertRepository;
        this.hiveRepository = hiveRepository;
        this.anomalyDetector = anomalyDetector;
        this.notificationService = notificationService;
    }

    public AIAlertService(
            AIAlertRepository aiAlertRepository,
            HiveRepository hiveRepository,
            HiveAnomalyDetector anomalyDetector
    ) {
        this(aiAlertRepository, hiveRepository, anomalyDetector, null);
    }

    @Transactional
    public void evaluateAndSaveTelemetryAlert(SensorReading reading) {
        if (reading == null || reading.getHive() == null) return;
        TelemetryAnalysisResponse analysis = anomalyDetector.analyzeSensorReading(reading);
        if (analysis != null && (analysis.getAlertStatus() != AIAlertStatus.NORMAL || analysis.getRiskScore() > 0)) {
            String hiveId = reading.getHive().getHiveId();
            Instant readingTime = reading.getTimestamp() != null ? reading.getTimestamp() : Instant.now();

            // Deduplication Strategy: Prevent generating duplicate alerts for persistent conditions within 15 mins
            Optional<AIAlert> latestAlertOpt = aiAlertRepository.findFirstByHiveHiveIdOrderByTimestampDesc(hiveId);
            if (latestAlertOpt.isPresent()) {
                AIAlert latestAlert = latestAlertOpt.get();
                Instant latestTime = latestAlert.getTimestamp() != null ? latestAlert.getTimestamp() : latestAlert.getCreatedAt();

                boolean isWithinCooldown = Duration.between(latestTime, readingTime).abs().compareTo(DEDUPLICATION_COOLDOWN) <= 0;
                boolean isSameStatus = latestAlert.getStatus() == analysis.getAlertStatus();

                // If identical severity condition persists within 15 minutes, skip duplicate creation
                if (isWithinCooldown && isSameStatus) {
                    return;
                }
            }

            String factors = String.join(", ", analysis.getAnomalyFactors());
            String alertType = analysis.getScreeningMethod() != null && analysis.getScreeningMethod().contains("SENSOR_HEALTH")
                    ? "SENSOR_FAILURE"
                    : "TELEMETRY_ANOMALY";
            String modelVer = analysis.getModelVersion() != null ? analysis.getModelVersion() : "honeychain-anomaly-v1";

            AIAlert alert = new AIAlert(
                    reading.getHive(),
                    analysis.getRiskScore(),
                    analysis.getAlertStatus(),
                    analysis.getMessage(),
                    factors,
                    readingTime,
                    alertType,
                    modelVer
            );

            AIAlert savedAlert = aiAlertRepository.save(alert);

            if (notificationService != null) {
                notificationService.dispatchNotification(savedAlert);
            }
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
    public List<AIAlertResponse> getUnreadAlerts() {
        return aiAlertRepository.findByIsReadFalseOrderByTimestampDesc()
                .stream()
                .map(DtoMapper::toAIAlertResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return aiAlertRepository.countByIsReadFalse();
    }

    @Transactional
    public AIAlertResponse markAsRead(String alertId) {
        AIAlert alert = aiAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("AI alert not found with ID: " + alertId));

        if (!alert.isRead()) {
            alert.setRead(true);
            alert.setReadAt(Instant.now());
            alert = aiAlertRepository.save(alert);
        }

        return DtoMapper.toAIAlertResponse(alert);
    }

    @Transactional
    public AIAlertResponse acknowledgeAlert(String alertId, String username) {
        AIAlert alert = aiAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("AI alert not found with ID: " + alertId));

        if (!alert.isRead()) {
            alert.setRead(true);
            alert.setReadAt(Instant.now());
        }

        if (!alert.isAcknowledged()) {
            alert.setAcknowledged(true);
            alert.setAcknowledgedAt(Instant.now());
            alert.setAcknowledgedBy(username != null ? username : "System User");
            alert = aiAlertRepository.save(alert);
        }

        return DtoMapper.toAIAlertResponse(alert);
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

