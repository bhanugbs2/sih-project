package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.PackageStatus;
import java.time.Instant;

public class PackageResponse {

    private String id;
    private String packageId;
    private String batchId;
    private String qrUrl;
    private PackageStatus status;
    private Instant packagingDate;
    private Instant createdAt;
    private Instant updatedAt;

    public PackageResponse() {}

    public PackageResponse(String id, String packageId, String batchId, String qrUrl, PackageStatus status, Instant packagingDate, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.packageId = packageId;
        this.batchId = batchId;
        this.qrUrl = qrUrl;
        this.status = status;
        this.packagingDate = packagingDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPackageId() { return packageId; }
    public void setPackageId(String packageId) { this.packageId = packageId; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getQrUrl() { return qrUrl; }
    public void setQrUrl(String qrUrl) { this.qrUrl = qrUrl; }

    public PackageStatus getStatus() { return status; }
    public void setStatus(PackageStatus status) { this.status = status; }

    public Instant getPackagingDate() { return packagingDate; }
    public void setPackagingDate(Instant packagingDate) { this.packagingDate = packagingDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
