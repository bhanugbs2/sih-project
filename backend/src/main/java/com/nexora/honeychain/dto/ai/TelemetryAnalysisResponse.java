package com.nexora.honeychain.dto.ai;

import com.nexora.honeychain.model.enums.AIAlertStatus;
import java.util.List;

public class TelemetryAnalysisResponse {

    private String hiveId;
    private Double riskScore;
    private AIAlertStatus alertStatus;
    private String message;
    private List<String> anomalyFactors;

    public TelemetryAnalysisResponse() {}

    public TelemetryAnalysisResponse(String hiveId, Double riskScore, AIAlertStatus alertStatus, String message, List<String> anomalyFactors) {
        this.hiveId = hiveId;
        this.riskScore = riskScore;
        this.alertStatus = alertStatus;
        this.message = message;
        this.anomalyFactors = anomalyFactors;
    }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public AIAlertStatus getAlertStatus() { return alertStatus; }
    public void setAlertStatus(AIAlertStatus alertStatus) { this.alertStatus = alertStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<String> getAnomalyFactors() { return anomalyFactors; }
    public void setAnomalyFactors(List<String> anomalyFactors) { this.anomalyFactors = anomalyFactors; }
}
