package com.nexora.honeychain.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class CreateProcessingRecordRequest {

    @NotBlank(message = "operation is required")
    private String operation;

    private String processType;
    private String operator;
    private String description;
    private String verifiedBy;
    private Instant startedAt;
    private Instant completedAt;
    private Double processingTemperature;
    private String tempSource = "Manual Processing Temperature";

    public CreateProcessingRecordRequest() {}

    public CreateProcessingRecordRequest(String processType, String description, String verifiedBy) {
        this.processType = processType;
        this.operation = processType;
        this.description = description;
        this.verifiedBy = verifiedBy;
        this.operator = verifiedBy;
    }

    public CreateProcessingRecordRequest(String operation, String operator, String description, Instant startedAt, Instant completedAt, Double processingTemperature) {
        this.operation = operation;
        this.processType = operation;
        this.operator = operator;
        this.verifiedBy = operator;
        this.description = description;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.processingTemperature = processingTemperature;
        this.tempSource = "Manual Processing Temperature";
    }

    public String getOperation() { return operation != null ? operation : processType; }
    public void setOperation(String operation) {
        this.operation = operation;
        this.processType = operation;
    }

    public String getProcessType() { return processType != null ? processType : operation; }
    public void setProcessType(String processType) {
        this.processType = processType;
        this.operation = processType;
    }

    public String getOperator() { return operator != null ? operator : verifiedBy; }
    public void setOperator(String operator) {
        this.operator = operator;
        this.verifiedBy = operator;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVerifiedBy() { return verifiedBy != null ? verifiedBy : operator; }
    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
        this.operator = verifiedBy;
    }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public Double getProcessingTemperature() { return processingTemperature; }
    public void setProcessingTemperature(Double processingTemperature) { this.processingTemperature = processingTemperature; }

    public String getTempSource() { return tempSource; }
    public void setTempSource(String tempSource) { this.tempSource = tempSource; }
}
