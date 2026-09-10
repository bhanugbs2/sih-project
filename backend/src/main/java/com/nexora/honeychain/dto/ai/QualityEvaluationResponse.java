package com.nexora.honeychain.dto.ai;

import java.util.List;

public class QualityEvaluationResponse {

    private String batchId;
    private Double purityScore;
    private String adulterationClass;
    private String recommendation;
    private List<String> riskFactors;
    private String modelVersion;
    private String screeningMethod;
    private Double confidenceScore;

    public QualityEvaluationResponse() {}

    public QualityEvaluationResponse(String batchId, Double purityScore, String adulterationClass, String recommendation, List<String> riskFactors) {
        this.batchId = batchId;
        this.purityScore = purityScore;
        this.adulterationClass = adulterationClass;
        this.recommendation = recommendation;
        this.riskFactors = riskFactors;
        this.modelVersion = "honeychain-quality-v1";
        this.screeningMethod = "ML_RANDOM_FOREST";
        this.confidenceScore = 0.94;
    }

    public QualityEvaluationResponse(String batchId, Double purityScore, String adulterationClass, String recommendation, List<String> riskFactors, String modelVersion, String screeningMethod, Double confidenceScore) {
        this.batchId = batchId;
        this.purityScore = purityScore;
        this.adulterationClass = adulterationClass;
        this.recommendation = recommendation;
        this.riskFactors = riskFactors;
        this.modelVersion = modelVersion;
        this.screeningMethod = screeningMethod;
        this.confidenceScore = confidenceScore;
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

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getScreeningMethod() { return screeningMethod; }
    public void setScreeningMethod(String screeningMethod) { this.screeningMethod = screeningMethod; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
}
