package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.HiveStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public class CreateHiveRequest {

    @NotBlank(message = "hiveId is required")
    private String hiveId;

    @NotBlank(message = "farmId is required")
    private String farmId;

    @NotBlank(message = "name is required")
    private String name;

    private String location;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private HiveStatus status = HiveStatus.ACTIVE;

    public CreateHiveRequest() {}

    public CreateHiveRequest(String hiveId, String farmId, String name, String location, Double latitude, Double longitude, HiveStatus status) {
        this.hiveId = hiveId;
        this.farmId = farmId;
        this.name = name;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status != null ? status : HiveStatus.ACTIVE;
    }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public String getFarmId() { return farmId; }
    public void setFarmId(String farmId) { this.farmId = farmId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public HiveStatus getStatus() { return status; }
    public void setStatus(HiveStatus status) { this.status = status; }
}
