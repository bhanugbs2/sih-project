package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class CreateHoneyBatchRequest {

    @NotBlank(message = "batchId is required")
    private String batchId;

    @NotBlank(message = "hiveId is required")
    private String hiveId;

    @NotNull(message = "harvestDate is required")
    private LocalDate harvestDate;

    @NotNull(message = "quantity is required")
    @Positive(message = "quantity must be greater than 0")
    private Double quantity;

    @NotBlank(message = "unit is required")
    private String unit;

    private String harvestNotes;
    private String quantitySource = "Manual Harvest Quantity";
    private HoneyBatchStatus status = HoneyBatchStatus.HARVESTED;

    public CreateHoneyBatchRequest() {}

    public CreateHoneyBatchRequest(String batchId, String hiveId, LocalDate harvestDate, Double quantity, String unit, HoneyBatchStatus status) {
        this.batchId = batchId;
        this.hiveId = hiveId;
        this.harvestDate = harvestDate;
        this.quantity = quantity;
        this.unit = unit;
        this.status = status != null ? status : HoneyBatchStatus.HARVESTED;
        this.quantitySource = "Manual Harvest Quantity";
    }

    public CreateHoneyBatchRequest(String batchId, String hiveId, LocalDate harvestDate, Double quantity, String unit, String harvestNotes, String quantitySource, HoneyBatchStatus status) {
        this.batchId = batchId;
        this.hiveId = hiveId;
        this.harvestDate = harvestDate;
        this.quantity = quantity;
        this.unit = unit;
        this.harvestNotes = harvestNotes;
        this.quantitySource = quantitySource != null ? quantitySource : "Manual Harvest Quantity";
        this.status = status != null ? status : HoneyBatchStatus.HARVESTED;
    }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

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
}
