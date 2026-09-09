package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.QualityTestResult;
import java.time.Instant;

public class QualityTestResponse {

    private String id;
    private String batchId;
    private Double moisture;
    private Double pH;
    private String color;
    private String notes;
    private QualityTestResult result;
    private String verifiedBy;
    private Instant timestamp;
    private Instant testedAt;
    private Instant createdAt;

    // Optional embedded Phase 6 AI screening summary
    private String aiScreeningClass;
    private Double aiPurityScore;
    private String aiRecommendation;

    public QualityTestResponse() {}

    public QualityTestResponse(String id, String batchId, Double moisture, Double pH, String color, QualityTestResult result, String verifiedBy, Instant timestamp, Instant createdAt) {
        this.id = id;
        this.batchId = batchId;
        this.moisture = moisture;
        this.pH = pH;
        this.color = color;
        this.result = result;
        this.verifiedBy = verifiedBy;
        this.timestamp = timestamp;
        this.testedAt = timestamp;
        this.createdAt = createdAt;
    }

    public QualityTestResponse(String id, String batchId, Double moisture, Double pH, String color, String notes, QualityTestResult result, String verifiedBy, Instant timestamp, Instant testedAt, Instant createdAt) {
        this.id = id;
        this.batchId = batchId;
        this.moisture = moisture;
        this.pH = pH;
        this.color = color;
        this.notes = notes;
        this.result = result;
        this.verifiedBy = verifiedBy;
        this.timestamp = timestamp;
        this.testedAt = testedAt != null ? testedAt : timestamp;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public Double getMoisture() { return moisture; }
    public void setMoisture(Double moisture) { this.moisture = moisture; }

    public Double getPH() { return pH; }
    public void setPH(Double pH) { this.pH = pH; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public QualityTestResult getResult() { return result; }
    public void setResult(QualityTestResult result) { this.result = result; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getTestedAt() { return testedAt != null ? testedAt : timestamp; }
    public void setTestedAt(Instant testedAt) { this.testedAt = testedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getAiScreeningClass() { return aiScreeningClass; }
    public void setAiScreeningClass(String aiScreeningClass) { this.aiScreeningClass = aiScreeningClass; }

    public Double getAiPurityScore() { return aiPurityScore; }
    public void setAiPurityScore(Double aiPurityScore) { this.aiPurityScore = aiPurityScore; }

    public String getAiRecommendation() { return aiRecommendation; }
    public void setAiRecommendation(String aiRecommendation) { this.aiRecommendation = aiRecommendation; }
}
