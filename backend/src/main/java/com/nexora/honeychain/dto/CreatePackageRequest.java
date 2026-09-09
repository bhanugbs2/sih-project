package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.PackageStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;

public class CreatePackageRequest {

    @NotBlank(message = "packageId is required")
    private String packageId;

    @NotBlank(message = "batchId is required")
    private String batchId;

    private String packagingDate;

    private PackageStatus status = PackageStatus.PACKAGED;

    public CreatePackageRequest() {}

    public CreatePackageRequest(String packageId, String batchId, String packagingDate, PackageStatus status) {
        this.packageId = packageId;
        this.batchId = batchId;
        this.packagingDate = packagingDate;
        this.status = status != null ? status : PackageStatus.PACKAGED;
    }

    public String getPackageId() { return packageId; }
    public void setPackageId(String packageId) { this.packageId = packageId; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getPackagingDate() { return packagingDate; }
    public void setPackagingDate(String packagingDate) { this.packagingDate = packagingDate; }

    public PackageStatus getStatus() { return status; }
    public void setStatus(PackageStatus status) { this.status = status; }

    public Instant getPackagingDateAsInstant() {
        if (packagingDate == null || packagingDate.isBlank()) {
            return Instant.now();
        }
        try {
            if (packagingDate.contains("T")) {
                return Instant.parse(packagingDate);
            }
            return LocalDate.parse(packagingDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
        } catch (Exception e) {
            return Instant.now();
        }
    }
}
