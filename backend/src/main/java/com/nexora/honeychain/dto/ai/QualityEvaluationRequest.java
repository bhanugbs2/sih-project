package com.nexora.honeychain.dto.ai;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public class QualityEvaluationRequest {

    private String batchId;

    @DecimalMin(value = "0.0", message = "Moisture must be >= 0")
    @DecimalMax(value = "100.0", message = "Moisture must be <= 100")
    private Double moisture;

    @DecimalMin(value = "0.0", message = "pH must be >= 0")
    @DecimalMax(value = "14.0", message = "pH must be <= 14")
    private Double ph;

    private String color;

    public QualityEvaluationRequest() {}

    public QualityEvaluationRequest(String batchId, Double moisture, Double ph, String color) {
        this.batchId = batchId;
        this.moisture = moisture;
        this.ph = ph;
        this.color = color;
    }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public Double getMoisture() { return moisture; }
    public void setMoisture(Double moisture) { this.moisture = moisture; }

    public Double getPh() { return ph; }
    public void setPh(Double ph) { this.ph = ph; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
