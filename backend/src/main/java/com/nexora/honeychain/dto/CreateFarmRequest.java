package com.nexora.honeychain.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public class CreateFarmRequest {

    @NotBlank(message = "farmId is required")
    private String farmId;

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "ownerName is required")
    private String ownerName;

    private String location;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    public CreateFarmRequest() {}

    public CreateFarmRequest(String farmId, String name, String ownerName, String location, Double latitude, Double longitude) {
        this.farmId = farmId;
        this.name = name;
        this.ownerName = ownerName;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getFarmId() { return farmId; }
    public void setFarmId(String farmId) { this.farmId = farmId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
