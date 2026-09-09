package com.nexora.honeychain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "processing_records")
public class ProcessingRecord {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private HoneyBatch batch;

    @NotBlank
    @Column(name = "process_type", nullable = false)
    private String processType;

    @Column(name = "operation")
    private String operation;

    @Column(name = "operator")
    private String operator;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "processing_temperature")
    private Double processingTemperature;

    @Column(name = "temp_source")
    private String tempSource = "Manual Processing Temperature";

    @Column(name = "description", length = 1000)
    private String description;

    @NotNull
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
        if (this.startedAt == null) {
            this.startedAt = this.timestamp;
        }
        if (this.completedAt == null) {
            this.completedAt = this.timestamp;
        }
        if (this.operation == null) {
            this.operation = this.processType;
        }
        if (this.operator == null) {
            this.operator = this.verifiedBy;
        }
        if (this.tempSource == null) {
            this.tempSource = "Manual Processing Temperature";
        }
        this.createdAt = Instant.now();
    }

    public ProcessingRecord() {}

    public ProcessingRecord(HoneyBatch batch, String processType, String description, Instant timestamp, String verifiedBy) {
        this.batch = batch;
        this.processType = processType;
        this.operation = processType;
        this.description = description;
        this.timestamp = timestamp;
        this.startedAt = timestamp;
        this.completedAt = timestamp;
        this.verifiedBy = verifiedBy;
        this.operator = verifiedBy;
        this.tempSource = "Manual Processing Temperature";
    }

    public ProcessingRecord(HoneyBatch batch, String operation, String operator, Instant startedAt, Instant completedAt, Double processingTemperature, String description) {
        this.batch = batch;
        this.processType = operation;
        this.operation = operation;
        this.operator = operator;
        this.verifiedBy = operator;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.processingTemperature = processingTemperature;
        this.description = description;
        this.timestamp = completedAt != null ? completedAt : Instant.now();
        this.tempSource = "Manual Processing Temperature";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public HoneyBatch getBatch() { return batch; }
    public void setBatch(HoneyBatch batch) { this.batch = batch; }

    public String getProcessType() { return processType; }
    public void setProcessType(String processType) { this.processType = processType; }

    public String getOperation() { return operation != null ? operation : processType; }
    public void setOperation(String operation) {
        this.operation = operation;
        this.processType = operation;
    }

    public String getOperator() { return operator != null ? operator : verifiedBy; }
    public void setOperator(String operator) {
        this.operator = operator;
        this.verifiedBy = operator;
    }

    public Instant getStartedAt() { return startedAt != null ? startedAt : timestamp; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt != null ? completedAt : timestamp; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public Double getProcessingTemperature() { return processingTemperature; }
    public void setProcessingTemperature(Double processingTemperature) { this.processingTemperature = processingTemperature; }

    public String getTempSource() { return tempSource; }
    public void setTempSource(String tempSource) { this.tempSource = tempSource; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getVerifiedBy() { return verifiedBy != null ? verifiedBy : operator; }
    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
        this.operator = verifiedBy;
    }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
