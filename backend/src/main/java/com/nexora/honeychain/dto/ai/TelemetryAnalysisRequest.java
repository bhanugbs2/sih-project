package com.nexora.honeychain.dto.ai;

import jakarta.validation.constraints.NotBlank;

public class TelemetryAnalysisRequest {

    @NotBlank(message = "Hive ID is required")
    private String hiveId;

    private Double temperature;
    private Double humidity;
    private Double soundLevel;

    public TelemetryAnalysisRequest() {}

    public TelemetryAnalysisRequest(String hiveId, Double temperature, Double humidity, Double soundLevel) {
        this.hiveId = hiveId;
        this.temperature = temperature;
        this.humidity = humidity;
        this.soundLevel = soundLevel;
    }

    public String getHiveId() { return hiveId; }
    public void setHiveId(String hiveId) { this.hiveId = hiveId; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getSoundLevel() { return soundLevel; }
    public void setSoundLevel(Double soundLevel) { this.soundLevel = soundLevel; }
}
