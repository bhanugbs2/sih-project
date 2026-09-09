package com.nexora.honeychain.model;

import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "honey_batches")
public class HoneyBatch {

    @Id
    private String id;

    @NotBlank
    @Column(name = "batch_id", nullable = false, unique = true)
    private String batchId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hive_id", nullable = false)
    private Hive hive;

    @NotNull
    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @NotNull
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @NotBlank
    @Column(name = "unit", nullable = false)
    private String unit;

    @Column(name = "harvest_notes", length = 1000)
    private String harvestNotes;

    @Column(name = "quantity_source")
    private String quantitySource = "Manual Harvest Quantity";

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HoneyBatchStatus status = HoneyBatchStatus.HARVESTED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.quantitySource == null) {
            this.quantitySource = "Manual Harvest Quantity";
        }
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public HoneyBatch() {}

    public HoneyBatch(String batchId, Hive hive, LocalDate harvestDate, Double quantity, String unit, HoneyBatchStatus status) {
        this.batchId = batchId;
        this.hive = hive;
        this.harvestDate = harvestDate;
        this.quantity = quantity;
        this.unit = unit;
        this.status = status != null ? status : HoneyBatchStatus.HARVESTED;
        this.quantitySource = "Manual Harvest Quantity";
    }

    public HoneyBatch(String batchId, Hive hive, LocalDate harvestDate, Double quantity, String unit, String harvestNotes, String quantitySource, HoneyBatchStatus status) {
        this.batchId = batchId;
        this.hive = hive;
        this.harvestDate = harvestDate;
        this.quantity = quantity;
        this.unit = unit;
        this.harvestNotes = harvestNotes;
        this.quantitySource = quantitySource != null ? quantitySource : "Manual Harvest Quantity";
        this.status = status != null ? status : HoneyBatchStatus.HARVESTED;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public Hive getHive() { return hive; }
    public void setHive(Hive hive) { this.hive = hive; }

    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate harvestDate) { this.harvestDate = harvestDate; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getHarvestNotes() { return harvestNotes; }
    public void setHarvestNotes(String harvestNotes) { this.harvestNotes = harvestNotes; }

    public String getQuantitySource() { return quantitySource; }
    public void setQuantitySource(String quantitySource) { this.quantitySource = quantitySource; }

    public HoneyBatchStatus getStatus() { return status; }
    public void setStatus(HoneyBatchStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
