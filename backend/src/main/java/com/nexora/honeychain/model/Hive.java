package com.nexora.honeychain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "hives")
public class Hive {

    @Id
    private String id;

    @NotBlank
    @Column(name = "hive_code", nullable = false, unique = true)
    private String hiveCode;

    @NotBlank
    @Column(name = "apiary_location", nullable = false)
    private String apiaryLocation;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "installed_at")
    private Instant installedAt = Instant.now();

    @Column(name = "last_ping")
    private Instant lastPing;

    public Hive() {}

    public Hive(String id, String hiveCode, String apiaryLocation, Double latitude, Double longitude, String status) {
        this.id = id;
        this.hiveCode = hiveCode;
        this.apiaryLocation = apiaryLocation;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.installedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHiveCode() { return hiveCode; }
    public void setHiveCode(String hiveCode) { this.hiveCode = hiveCode; }

    public String getApiaryLocation() { return apiaryLocation; }
    public void setApiaryLocation(String apiaryLocation) { this.apiaryLocation = apiaryLocation; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getInstalledAt() { return installedAt; }
    public void setInstalledAt(Instant installedAt) { this.installedAt = installedAt; }

    public Instant getLastPing() { return lastPing; }
    public void setLastPing(Instant lastPing) { this.lastPing = lastPing; }
}
