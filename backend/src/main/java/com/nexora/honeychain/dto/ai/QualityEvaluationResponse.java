package com.nexora.honeychain.dto.ai;

import java.util.List;

public class QualityEvaluationResponse {

    private String batchId;
    private Double purityScore;
    private String adulterationClass;
    private String recommendation;
    private List<String> riskFactors;

    public QualityEvaluationResponse() {}

    public QualityEvaluationResponse(String batchId, Double purityScore, String adulterationClass, String recommendation, List<String> riskFactors) {
        this.batchId = batchId;
        this.purityScore = purityScore;
        this.adulterationClass = adulterationClass;
        this.recommendation = recommendation;
        this.riskFactors = riskFactors;
    }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public Double getPurityScore() { return purityScore; }
    public void setPurityScore(Double purityScore) { this.purityScore = purityScore; }

    public String getAdulterationClass() { return adulterationClass; }
    public void setAdulterationClass(String adulterationClass) { this.adulterationClass = adulterationClass; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public List<String> getRiskFactors() { return riskFactors; }
    public void setRiskFactors(List<String> riskFactors) { this.riskFactors = riskFactors; }
}
