package com.nexora.honeychain.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateGatewayRequest {

    @NotBlank(message = "gatewayId is required")
    private String gatewayId;

    @NotBlank(message = "name is required")
    private String name;

    private String farmId;
    private String apiaryId;
    private String hiveId;

    @NotBlank(message = "hardwareVersion is required")
    private String hardwareVersion;

    @NotBlank(message = "firmwareVersion is required")
    private String firmwareVersion;

    private String status; // ONLINE, OFFLINE, DEGRADED, MAINTENANCE
    private String powerStatus;
    private String ipAddress;

    public CreateGatewayRequest() {}

    public CreateGatewayRequest(String gatewayId, String name, String farmId, String apiaryId, String hiveId, String hardwareVersion, String firmwareVersion, String status, String powerStatus, String ipAddress) {
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
    }

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
}
