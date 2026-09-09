package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.QualityTestResult;
import jakarta.validation.constraints.DecimalMin;

public class CreateQualityTestRequest {

    @DecimalMin(value = "0.0", message = "Moisture cannot be negative")
    private Double moisture;

    @DecimalMin(value = "0.0", message = "pH cannot be negative")
    private Double pH;

    private String color;
    private String notes;
    private QualityTestResult result = QualityTestResult.PASS;
    private String verifiedBy;

    public CreateQualityTestRequest() {}

    public CreateQualityTestRequest(Double moisture, Double pH, String color, QualityTestResult result, String verifiedBy) {
        this.moisture = moisture;
        this.pH = pH;
        this.color = color;
        this.result = result != null ? result : QualityTestResult.PASS;
        this.verifiedBy = verifiedBy;
    }

    public CreateQualityTestRequest(Double moisture, Double pH, String color, String notes, QualityTestResult result, String verifiedBy) {
        this.moisture = moisture;
        this.pH = pH;
        this.color = color;
        this.notes = notes;
        this.result = result != null ? result : QualityTestResult.PASS;
        this.verifiedBy = verifiedBy;
    }

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
}
