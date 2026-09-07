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
        this.createdAt = Instant.now();
    }

    public ProcessingRecord() {}

    public ProcessingRecord(HoneyBatch batch, String processType, String description, Instant timestamp, String verifiedBy) {
        this.batch = batch;
        this.processType = processType;
        this.description = description;
        this.timestamp = timestamp;
        this.verifiedBy = verifiedBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public HoneyBatch getBatch() { return batch; }
    public void setBatch(HoneyBatch batch) { this.batch = batch; }

    public String getProcessType() { return processType; }
    public void setProcessType(String processType) { this.processType = processType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
