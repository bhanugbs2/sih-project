package com.nexora.honeychain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "iot_gateway_devices")
public class IoTGatewayDevice {

    @Id
    private String id;

    @Column(name = "gateway_id", nullable = false, unique = true)
    private String gatewayId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "farm_id")
    private String farmId;

    @Column(name = "apiary_id")
    private String apiaryId;

    @Column(name = "hive_id")
    private String hiveId;

    @Column(name = "hardware_version", nullable = false)
    private String hardwareVersion;

    @Column(name = "firmware_version", nullable = false)
    private String firmwareVersion;

    @NotNull
    @Column(name = "status", nullable = false)
    private String status; // ONLINE, OFFLINE, DEGRADED, MAINTENANCE

    @Column(name = "power_status")
    private String powerStatus; // MAINS_OPERATIONAL, BATTERY_OK, BATTERY_LOW

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "last_seen")
    private Instant lastSeen;

    @Column(name = "last_telemetry_timestamp")
    private Instant lastTelemetryTimestamp;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.status == null) {
            this.status = "ONLINE";
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public IoTGatewayDevice() {}

    public IoTGatewayDevice(String gatewayId, String name, String farmId, String apiaryId, String hiveId, String hardwareVersion, String firmwareVersion, String status, String powerStatus, String ipAddress) {
        this.gatewayId = gatewayId;
        this.name = name;
        this.farmId = farmId;
        this.apiaryId = apiaryId;
        this.hiveId = hiveId;
        this.hardwareVersion = hardwareVersion;
        this.firmwareVersion = firmwareVersion;
        this.status = status;
        this.powerStatus = powerStatus;
        this.ipAddress = ipAddress;
        this.lastSeen = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGatewayId() { return gatewayId; }
    public void setGatewayId(String gatewayId) { this.gatewayId = gatewayId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFarmId() { return farmId; }
    public void setFarmId(String farmId) { this.farmId = farmId; }

    public String getApiaryId() { return apiaryId; }
    public void setApiaryId(String apiaryId) { this.apiaryId = apiaryId; }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public String getHardwareVersion() { return hardwareVersion; }
    public void setHardwareVersion(String hardwareVersion) { this.hardwareVersion = hardwareVersion; }

    public String getFirmwareVersion() { return firmwareVersion; }
    public void setFirmwareVersion(String firmwareVersion) { this.firmwareVersion = firmwareVersion; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPowerStatus() { return powerStatus; }
    public void setPowerStatus(String powerStatus) { this.powerStatus = powerStatus; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Instant getLastSeen() { return lastSeen; }
    public void setLastSeen(Instant lastSeen) { this.lastSeen = lastSeen; }

    public Instant getLastTelemetryTimestamp() { return lastTelemetryTimestamp; }
    public void setLastTelemetryTimestamp(Instant lastTelemetryTimestamp) { this.lastTelemetryTimestamp = lastTelemetryTimestamp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
