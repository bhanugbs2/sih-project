package com.nexora.honeychain.dto;

import java.time.Instant;

public class FarmResponse {

    private String id;
    private String farmId;
    private String name;
    private String ownerName;
    private String location;
    private Double latitude;
    private Double longitude;
    private Instant createdAt;
    private Instant updatedAt;

    public FarmResponse() {}

    public FarmResponse(String id, String farmId, String name, String ownerName, String location, Double latitude, Double longitude, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.farmId = farmId;
        this.name = name;
        this.ownerName = ownerName;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
