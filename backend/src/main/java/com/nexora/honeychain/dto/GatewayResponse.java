package com.nexora.honeychain.dto;

import java.time.Instant;

public class GatewayResponse {

    private String id;
    private String gatewayId;
    private String name;
    private String farmId;
    private String apiaryId;
    private String hiveId;
    private String hardwareVersion;
    private String firmwareVersion;
    private String status;
    private String powerStatus;
    private String ipAddress;
    private Instant lastSeen;
    private Instant lastTelemetryTimestamp;
    private Instant createdAt;

    public GatewayResponse() {}

    public GatewayResponse(String id, String gatewayId, String name, String farmId, String apiaryId, String hiveId, String hardwareVersion, String firmwareVersion, String status, String powerStatus, String ipAddress, Instant lastSeen, Instant lastTelemetryTimestamp, Instant createdAt) {
        this.id = id;
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
        this.lastSeen = lastSeen;
        this.lastTelemetryTimestamp = lastTelemetryTimestamp;
        this.createdAt = createdAt;
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
}
