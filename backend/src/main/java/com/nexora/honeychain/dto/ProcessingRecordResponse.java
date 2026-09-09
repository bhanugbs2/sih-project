package com.nexora.honeychain.dto;

import java.time.Instant;

public class ProcessingRecordResponse {

    private String id;
    private String batchId;
    private String processType;
    private String operation;
    private String operator;
    private String description;
    private String verifiedBy;
    private Instant startedAt;
    private Instant completedAt;
    private Double processingTemperature;
    private String tempSource;
    private Instant timestamp;
    private Instant createdAt;

    public ProcessingRecordResponse() {}

    public ProcessingRecordResponse(String id, String batchId, String processType, String description, String verifiedBy, Instant timestamp, Instant createdAt) {
        this.id = id;
        this.batchId = batchId;
        this.processType = processType;
        this.operation = processType;
        this.description = description;
        this.verifiedBy = verifiedBy;
        this.operator = verifiedBy;
        this.timestamp = timestamp;
        this.startedAt = timestamp;
        this.completedAt = timestamp;
        this.tempSource = "Manual Processing Temperature";
        this.createdAt = createdAt;
    }

    public ProcessingRecordResponse(String id, String batchId, String operation, String operator, String description, Instant startedAt, Instant completedAt, Double processingTemperature, String tempSource, Instant timestamp, Instant createdAt) {
        this.id = id;
        this.batchId = batchId;
        this.processType = operation;
        this.operation = operation;
        this.operator = operator;
        this.verifiedBy = operator;
        this.description = description;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.processingTemperature = processingTemperature;
        this.tempSource = tempSource != null ? tempSource : "Manual Processing Temperature";
        this.timestamp = timestamp;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getProcessType() { return processType; }
    public void setProcessType(String processType) { this.processType = processType; }

    public String getOperation() { return operation != null ? operation : processType; }
    public void setOperation(String operation) { this.operation = operation; }

    public String getOperator() { return operator != null ? operator : verifiedBy; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVerifiedBy() { return verifiedBy != null ? verifiedBy : operator; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public Instant getStartedAt() { return startedAt != null ? startedAt : timestamp; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt != null ? completedAt : timestamp; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public Double getProcessingTemperature() { return processingTemperature; }
    public void setProcessingTemperature(Double processingTemperature) { this.processingTemperature = processingTemperature; }

    public String getTempSource() { return tempSource; }
    public void setTempSource(String tempSource) { this.tempSource = tempSource; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
