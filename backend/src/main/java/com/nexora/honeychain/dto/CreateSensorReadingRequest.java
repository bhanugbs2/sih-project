package com.nexora.honeychain.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class CreateSensorReadingRequest {

    @NotBlank(message = "hiveId is required")
    private String hiveId;

    @DecimalMin(value = "-40.0", message = "Temperature must be >= -40°C")
    @DecimalMax(value = "80.0", message = "Temperature must be <= 80°C")
    private Double temperature;

    @DecimalMin(value = "0.0", message = "Humidity must be >= 0")
    @DecimalMax(value = "100.0", message = "Humidity must be <= 100")
    private Double humidity;

    @DecimalMin(value = "0.0", message = "Weight must be >= 0")
    private Double weight;

    @DecimalMin(value = "0.0", message = "Sound level must be >= 0")
    private Double soundLevel;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @NotNull(message = "timestamp is required")
    private Long timestamp;

    public CreateSensorReadingRequest() {}

    public CreateSensorReadingRequest(String hiveId, Double temperature, Double humidity, Double weight, Double soundLevel, Double latitude, Double longitude, Long timestamp) {
        this.hiveId = hiveId;
        this.temperature = temperature;
        this.humidity = humidity;
        this.weight = weight;
        this.soundLevel = soundLevel;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getSoundLevel() { return soundLevel; }
    public void setSoundLevel(Double soundLevel) { this.soundLevel = soundLevel; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }

    public Instant getTimestampAsInstant() {
        if (timestamp == null) return Instant.now();
        // If timestamp is given in epoch seconds (e.g. 1700000000) vs millis (> 100000000000L)
        if (timestamp > 100000000000L) {
            return Instant.ofEpochMilli(timestamp);
        }
        return Instant.ofEpochSecond(timestamp);
    }
}
