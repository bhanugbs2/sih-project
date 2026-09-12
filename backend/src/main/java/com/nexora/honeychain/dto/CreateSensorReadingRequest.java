package com.nexora.honeychain.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class CreateSensorReadingRequest {

    @NotBlank(message = "hiveId is required")
    private String hiveId;

    // Legacy fields
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

    // Industrial Multi-Sensor Parameters
    private Double internalTemperatureC; // SHT4x (°C)
    private Double internalHumidityRh;   // SHT4x (%RH)
    private Double weightKg;             // Load Cell (kg)
    private Double co2Ppm;               // SCD30 (ppm)
    private Double acousticLevel;
    private Double acousticRms;
    private Double acousticActivity;     // MEMS Mic
    private Double vibrationX;
    private Double vibrationY;
    private Double vibrationZ;
    private Double vibrationMagnitude;   // 3-Axis Accelerometer (g)

    // GNSS / GPS Telemetry Parameters (7th Sensor Category)
    private Double altitude;
    private Double positionAccuracy;
    private Integer satelliteCount;
    private String fixStatus; // NO_FIX, FIX_2D, FIX_3D, SIMULATED, NOT_INSTALLED
    private String gpsTimestamp;

    private String sensorStatus;
    private String dataQuality;

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
        this.internalTemperatureC = temperature;
        this.internalHumidityRh = humidity;
        this.weightKg = weight;
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

    public Double getInternalTemperatureC() {
        return internalTemperatureC != null ? internalTemperatureC : temperature;
    }
    public void setInternalTemperatureC(Double internalTemperatureC) {
        this.internalTemperatureC = internalTemperatureC;
    }

    public Double getInternalHumidityRh() {
        return internalHumidityRh != null ? internalHumidityRh : humidity;
    }
    public void setInternalHumidityRh(Double internalHumidityRh) {
        this.internalHumidityRh = internalHumidityRh;
    }

    public Double getWeightKg() {
        return weightKg != null ? weightKg : weight;
    }
    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getCo2Ppm() { return co2Ppm; }
    public void setCo2Ppm(Double co2Ppm) { this.co2Ppm = co2Ppm; }

    public Double getAcousticLevel() { return acousticLevel != null ? acousticLevel : soundLevel; }
    public void setAcousticLevel(Double acousticLevel) { this.acousticLevel = acousticLevel; }

    public Double getAcousticRms() { return acousticRms; }
    public void setAcousticRms(Double acousticRms) { this.acousticRms = acousticRms; }

    public Double getAcousticActivity() { return acousticActivity; }
    public void setAcousticActivity(Double acousticActivity) { this.acousticActivity = acousticActivity; }

    public Double getVibrationX() { return vibrationX; }
    public void setVibrationX(Double vibrationX) { this.vibrationX = vibrationX; }

    public Double getVibrationY() { return vibrationY; }
    public void setVibrationY(Double vibrationY) { this.vibrationY = vibrationY; }

    public Double getVibrationZ() { return vibrationZ; }
    public void setVibrationZ(Double vibrationZ) { this.vibrationZ = vibrationZ; }

    public Double getVibrationMagnitude() {
        if (vibrationMagnitude != null) return vibrationMagnitude;
        if (vibrationX != null || vibrationY != null || vibrationZ != null) {
            double vx = vibrationX != null ? vibrationX : 0.0;
            double vy = vibrationY != null ? vibrationY : 0.0;
            double vz = vibrationZ != null ? vibrationZ : 0.0;
            return Math.sqrt(vx * vx + vy * vy + vz * vz);
        }
        return null;
    }
    public void setVibrationMagnitude(Double vibrationMagnitude) {
        this.vibrationMagnitude = vibrationMagnitude;
    }

    public Double getAltitude() { return altitude; }
    public void setAltitude(Double altitude) { this.altitude = altitude; }

    public Double getPositionAccuracy() { return positionAccuracy; }
    public void setPositionAccuracy(Double positionAccuracy) { this.positionAccuracy = positionAccuracy; }

    public Integer getSatelliteCount() { return satelliteCount; }
    public void setSatelliteCount(Integer satelliteCount) { this.satelliteCount = satelliteCount; }

    public String getFixStatus() { return fixStatus != null ? fixStatus : "NO_FIX"; }
    public void setFixStatus(String fixStatus) { this.fixStatus = fixStatus; }

    public String getGpsTimestamp() { return gpsTimestamp; }
    public void setGpsTimestamp(String gpsTimestamp) { this.gpsTimestamp = gpsTimestamp; }

    public String getSensorStatus() { return sensorStatus; }
    public void setSensorStatus(String sensorStatus) { this.sensorStatus = sensorStatus; }

    public String getDataQuality() { return dataQuality; }
    public void setDataQuality(String dataQuality) { this.dataQuality = dataQuality; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }

    public Instant getTimestampAsInstant() {
        if (timestamp == null) return Instant.now();
        if (timestamp > 100000000000L) {
            return Instant.ofEpochMilli(timestamp);
        }
        return Instant.ofEpochSecond(timestamp);
    }
}
