package com.nexora.honeychain.dto;

import java.util.ArrayList;
import java.util.List;

public class AIStatusResponse {

    private String hiveId;
    private Double riskScore;
    private String status;
    private String message;
    private List<String> factors;

    public AIStatusResponse() {
        this.factors = new ArrayList<>();
    }

    public AIStatusResponse(String hiveId, Double riskScore, String status, String message, List<String> factors) {
        this.hiveId = hiveId;
        this.riskScore = riskScore;
        this.status = status;
        this.message = message;
        this.factors = factors != null ? factors : new ArrayList<>();
    }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<String> getFactors() { return factors; }
    public void setFactors(List<String> factors) { this.factors = factors; }
}
