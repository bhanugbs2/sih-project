package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import java.time.Instant;
import java.time.LocalDate;

public class HoneyBatchResponse {

    private String id;
    private String batchId;
    private String hiveId;
    private String farmId;
    private String farmName;
    private LocalDate harvestDate;
    private Double quantity;
    private String unit;
    private String harvestNotes;
    private String quantitySource;
    private HoneyBatchStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public HoneyBatchResponse() {}

    public HoneyBatchResponse(String id, String batchId, String hiveId, LocalDate harvestDate, Double quantity, String unit, HoneyBatchStatus status, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.batchId = batchId;
        this.hiveId = hiveId;
        this.harvestDate = harvestDate;
        this.quantity = quantity;
        this.unit = unit;
        this.status = status;
        this.quantitySource = "Manual Harvest Quantity";
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public HoneyBatchResponse(String id, String batchId, String hiveId, String farmId, String farmName, LocalDate harvestDate, Double quantity, String unit, String harvestNotes, String quantitySource, HoneyBatchStatus status, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.batchId = batchId;
        this.hiveId = hiveId;
        this.farmId = farmId;
        this.farmName = farmName;
        this.harvestDate = harvestDate;
        this.quantity = quantity;
        this.unit = unit;
        this.harvestNotes = harvestNotes;
        this.quantitySource = quantitySource != null ? quantitySource : "Manual Harvest Quantity";
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public String getFarmId() { return farmId; }
    public void setFarmId(String farmId) { this.farmId = farmId; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

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
