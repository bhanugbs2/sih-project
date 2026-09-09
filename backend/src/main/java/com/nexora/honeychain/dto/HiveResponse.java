package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.HiveStatus;
import java.time.Instant;

public class HiveResponse {

    private String id;
    private String hiveId;
    private String farmId;
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private HiveStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public HiveResponse() {}

    public HiveResponse(String id, String hiveId, String farmId, String name, String location, Double latitude, Double longitude, HiveStatus status, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.hiveId = hiveId;
        this.farmId = farmId;
        this.name = name;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
