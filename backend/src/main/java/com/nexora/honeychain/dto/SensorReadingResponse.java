package com.nexora.honeychain.dto;

public class SensorReadingResponse {

    private String id;
    private String hiveId;
    private Double temperature;
    private Double humidity;
    private Double weight;
    private Double soundLevel;
    private Double latitude;
    private Double longitude;
    private Long timestamp;

    public SensorReadingResponse() {}

    public SensorReadingResponse(String id, String hiveId, Double temperature, Double humidity, Double weight, Double soundLevel, Double latitude, Double longitude, Long timestamp) {
        this.id = id;
        this.hiveId = hiveId;
        this.temperature = temperature;
        this.humidity = humidity;
        this.weight = weight;
        this.soundLevel = soundLevel;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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
}
