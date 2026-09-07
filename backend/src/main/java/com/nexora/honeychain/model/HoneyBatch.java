package com.nexora.honeychain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "honey_batches")
public class HoneyBatch {

    @Id
    private String id;

    @NotBlank
    @Column(name = "batch_code", nullable = false, unique = true)
    private String batchCode;

    @Column(name = "hive_id")
    private String hiveId;

    @NotBlank
    @Column(name = "floral_source", nullable = false)
    private String floralSource;

    @NotNull
    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @NotNull
    @Column(name = "harvest_weight_kg", nullable = false)
    private Double harvestWeightKg;

    @Column(nullable = false)
    private String status = "HARVESTED";

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public HoneyBatch() {}

    public HoneyBatch(String id, String batchCode, String hiveId, String floralSource, LocalDate harvestDate, Double harvestWeightKg, String status) {
        this.id = id;
        this.batchCode = batchCode;
        this.hiveId = hiveId;
        this.floralSource = floralSource;
        this.harvestDate = harvestDate;
        this.harvestWeightKg = harvestWeightKg;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public String getFloralSource() { return floralSource; }
    public void setFloralSource(String floralSource) { this.floralSource = floralSource; }

    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate harvestDate) { this.harvestDate = harvestDate; }

    public Double getHarvestWeightKg() { return harvestWeightKg; }
    public void setHarvestWeightKg(Double harvestWeightKg) { this.harvestWeightKg = harvestWeightKg; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
