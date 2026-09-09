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
}
