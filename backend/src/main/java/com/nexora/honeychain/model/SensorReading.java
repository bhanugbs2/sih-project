package com.nexora.honeychain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sensor_readings", indexes = {
    @Index(name = "idx_sensor_reading_hive_timestamp", columnList = "hive_id, timestamp")
})
public class SensorReading {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hive_id", nullable = false)
    private Hive hive;

    // Legacy prototype telemetry fields (DHT22)
    private Double temperature;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private Double humidity;

    @DecimalMin(value = "0.0")
    private Double weight;

    @DecimalMin(value = "0.0")
    @Column(name = "sound_level")
    private Double soundLevel;

    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double latitude;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double longitude;

    // Industrial Multi-Sensor Fields
    @Column(name = "internal_temperature_c")
    private Double internalTemperatureC; // Sensirion SHT4x (°C)

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    @Column(name = "internal_humidity_rh")
    private Double internalHumidityRh; // Sensirion SHT4x (%RH)

    @DecimalMin(value = "0.0")
    @Column(name = "weight_kg")
    private Double weightKg; // Industrial Strain-Gauge Load Cell (kg)

    @DecimalMin(value = "0.0")
    @Column(name = "co2_ppm")
    private Double co2Ppm; // Sensirion SCD30 (ppm)

    @DecimalMin(value = "0.0")
    @Column(name = "acoustic_level")
    private Double acousticLevel;

    @DecimalMin(value = "0.0")
    @Column(name = "acoustic_rms")
    private Double acousticRms;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "1.0")
    @Column(name = "acoustic_activity")
    private Double acousticActivity; // MEMS Microphone Activity Score

    @Column(name = "vibration_x")
    private Double vibrationX;

    @Column(name = "vibration_y")
    private Double vibrationY;

    @Column(name = "vibration_z")
    private Double vibrationZ;

    @DecimalMin(value = "0.0")
    @Column(name = "vibration_magnitude")
    private Double vibrationMagnitude; // 3-Axis Accelerometer Magnitude (g)

    // GNSS / GPS Telemetry Fields (7th Sensor Category)
    @Column(name = "altitude")
    private Double altitude; // Meters above sea level

    @Column(name = "position_accuracy")
    private Double positionAccuracy; // Horizontal accuracy in meters

    @Column(name = "satellite_count")
    private Integer satelliteCount; // Number of tracked satellites

    @Column(name = "fix_status")
    private String fixStatus; // NO_FIX, FIX_2D, FIX_3D, SIMULATED, NOT_INSTALLED

    @Column(name = "gps_timestamp")
    private String gpsTimestamp; // Hardware GNSS timestamp

    @Column(name = "sensor_status")
    private String sensorStatus; // GOOD, WARNING, STALE, OFFLINE, CALIBRATION_REQUIRED

    @Column(name = "data_quality")
    private String dataQuality; // GOOD, SIMULATED, LEGACY_PROTOTYPE

    @NotNull
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
        if (this.vibrationMagnitude == null && (vibrationX != null || vibrationY != null || vibrationZ != null)) {
            double vx = vibrationX != null ? vibrationX : 0.0;
            double vy = vibrationY != null ? vibrationY : 0.0;
            double vz = vibrationZ != null ? vibrationZ : 0.0;
            this.vibrationMagnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);
        }
        if (this.sensorStatus == null) {
            this.sensorStatus = "GOOD";
        }
        if (this.dataQuality == null) {
            this.dataQuality = "GOOD";
        }
        this.createdAt = Instant.now();
    }

    public SensorReading() {}

    public SensorReading(Hive hive, Double temperature, Double humidity, Double weight, Double soundLevel, Instant timestamp) {
        this.hive = hive;
        this.temperature = temperature;
        this.humidity = humidity;
        this.weight = weight;
        this.soundLevel = soundLevel;
        this.timestamp = timestamp;
        this.internalTemperatureC = temperature;
        this.internalHumidityRh = humidity;
        this.weightKg = weight;
        this.dataQuality = "LEGACY_PROTOTYPE";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Hive getHive() { return hive; }
    public void setHive(Hive hive) { this.hive = hive; }

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

    public Double getVibrationMagnitude() { return vibrationMagnitude; }
    public void setVibrationMagnitude(Double vibrationMagnitude) { this.vibrationMagnitude = vibrationMagnitude; }

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

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
