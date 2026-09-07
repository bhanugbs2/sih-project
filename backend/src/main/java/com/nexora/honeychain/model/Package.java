package com.nexora.honeychain.model;

import com.nexora.honeychain.model.enums.PackageStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "packages")
public class Package {

    @Id
    private String id;

    @NotBlank
    @Column(name = "package_id", nullable = false, unique = true)
    private String packageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private HoneyBatch batch;

    @Column(name = "qr_url")
    private String qrUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PackageStatus status = PackageStatus.CREATED;

    @Column(name = "packaging_date")
    private Instant packagingDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.packagingDate == null) {
            this.packagingDate = Instant.now();
        }
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Package() {}

    public Package(String packageId, HoneyBatch batch, String qrUrl, PackageStatus status, Instant packagingDate) {
        this.packageId = packageId;
        this.batch = batch;
        this.qrUrl = qrUrl;
        this.status = status != null ? status : PackageStatus.CREATED;
        this.packagingDate = packagingDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPackageId() { return packageId; }
    public void setPackageId(String packageId) { this.packageId = packageId; }

    public HoneyBatch getBatch() { return batch; }
    public void setBatch(HoneyBatch batch) { this.batch = batch; }

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
