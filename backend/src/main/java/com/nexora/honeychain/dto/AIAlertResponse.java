package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.AIAlertStatus;
import java.time.Instant;

public class AIAlertResponse {

    private String id;
    private String hiveId;
    private Double riskScore;
    private AIAlertStatus status;
    private String message;
    private String factors;
    private Instant timestamp;
    private Instant createdAt;
    private boolean isRead;
    private Instant readAt;
    private boolean isAcknowledged;
    private Instant acknowledgedAt;
    private String acknowledgedBy;
    private String alertType;
    private String modelVersion;
    private String batchId;

    public AIAlertResponse() {}

    public AIAlertResponse(String id, String hiveId, Double riskScore, AIAlertStatus status, String message, String factors, Instant timestamp, Instant createdAt) {
        this.id = id;
        this.hiveId = hiveId;
        this.riskScore = riskScore;
        this.status = status;
        this.message = message;
        this.factors = factors;
        this.timestamp = timestamp;
        this.createdAt = createdAt;
        this.alertType = "TELEMETRY_ANOMALY";
        this.modelVersion = "honeychain-anomaly-v1";
    }

    public AIAlertResponse(String id, String hiveId, Double riskScore, AIAlertStatus status, String message, String factors, Instant timestamp, Instant createdAt, boolean isRead, Instant readAt, boolean isAcknowledged, Instant acknowledgedAt, String acknowledgedBy, String alertType, String modelVersion, String batchId) {
        this.id = id;
        this.hiveId = hiveId;
        this.riskScore = riskScore;
        this.status = status;
        this.message = message;
        this.factors = factors;
        this.timestamp = timestamp;
        this.createdAt = createdAt;
        this.isRead = isRead;
        this.readAt = readAt;
        this.isAcknowledged = isAcknowledged;
        this.acknowledgedAt = acknowledgedAt;
        this.acknowledgedBy = acknowledgedBy;
        this.alertType = alertType;
        this.modelVersion = modelVersion;
        this.batchId = batchId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public AIAlertStatus getStatus() { return status; }
    public void setStatus(AIAlertStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getFactors() { return factors; }
    public void setFactors(String factors) { this.factors = factors; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }

    public boolean isAcknowledged() { return isAcknowledged; }
    public void setAcknowledged(boolean acknowledged) { isAcknowledged = acknowledged; }

    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }

    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }
}
