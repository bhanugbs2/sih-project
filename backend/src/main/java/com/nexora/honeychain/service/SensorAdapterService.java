package com.nexora.honeychain.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import org.springframework.stereotype.Service;

@Service
public class SensorAdapterService {

    private final ObjectMapper objectMapper;

    public SensorAdapterService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Adapts raw JSON telemetry from industrial gateways, Modbus bridges, or MQTT payloads
     * into a canonical CreateSensorReadingRequest containing all 6 sensing categories:
     * Sensirion SHT4x (Internal Temp & Humidity), Sensirion SCD30 (CO2),
     * Industrial Load Cell (Weight), MEMS Mic (Acoustics), 3-Axis Accelerometer (Vibration).
     */
    public CreateSensorReadingRequest normalizeTelemetryPayload(String rawJson) throws Exception {
        JsonNode root = objectMapper.readTree(rawJson);

        String hiveId = root.hasNonNull("hiveId") ? root.get("hiveId").asText() : "HIVE-HIM-001";

        // Sensirion SHT4x Adapter
        Double internalTemperatureC = parseDoubleField(root, "internalTemperatureC");
        if (internalTemperatureC == null) internalTemperatureC = parseDoubleField(root, "temperature");

        Double internalHumidityRh = parseDoubleField(root, "internalHumidityRh");
        if (internalHumidityRh == null) internalHumidityRh = parseDoubleField(root, "humidity");

        // Industrial Load Cell Adapter
        Double weightKg = parseDoubleField(root, "weightKg");
        if (weightKg == null) weightKg = parseDoubleField(root, "weight");

        // Sensirion SCD30 CO2 Adapter
        Double co2Ppm = parseDoubleField(root, "co2Ppm");
        if (co2Ppm == null) co2Ppm = parseDoubleField(root, "co2");

        // MEMS Microphone Acoustic Adapter
        Double acousticActivity = parseDoubleField(root, "acousticActivity");
        Double acousticLevel = parseDoubleField(root, "acousticLevel");
        if (acousticLevel == null) acousticLevel = parseDoubleField(root, "soundLevel");
        Double acousticRms = parseDoubleField(root, "acousticRms");

        // 3-Axis Industrial Accelerometer Vibration Adapter
        Double vibrationX = parseDoubleField(root, "vibrationX");
        Double vibrationY = parseDoubleField(root, "vibrationY");
        Double vibrationZ = parseDoubleField(root, "vibrationZ");
        Double vibrationMagnitude = parseDoubleField(root, "vibrationMagnitude");

        if (vibrationMagnitude == null && (vibrationX != null || vibrationY != null || vibrationZ != null)) {
            double vx = vibrationX != null ? vibrationX : 0.0;
            double vy = vibrationY != null ? vibrationY : 0.0;
            double vz = vibrationZ != null ? vibrationZ : 0.0;
            vibrationMagnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);
        }

        Double latitude = parseDoubleField(root, "latitude");
        Double longitude = parseDoubleField(root, "longitude");

        Long timestamp = root.hasNonNull("timestamp") ? root.get("timestamp").asLong() : System.currentTimeMillis() / 1000L;

        CreateSensorReadingRequest request = new CreateSensorReadingRequest(
                hiveId,
                internalTemperatureC,
                internalHumidityRh,
                weightKg,
                acousticLevel,
                latitude,
                longitude,
                timestamp
        );

        request.setInternalTemperatureC(internalTemperatureC);
        request.setInternalHumidityRh(internalHumidityRh);
        request.setWeightKg(weightKg);
        request.setCo2Ppm(co2Ppm);
        request.setAcousticActivity(acousticActivity);
        request.setAcousticLevel(acousticLevel);
        request.setAcousticRms(acousticRms);
        request.setVibrationX(vibrationX);
        request.setVibrationY(vibrationY);
        request.setVibrationZ(vibrationZ);
        request.setVibrationMagnitude(vibrationMagnitude);

        if (root.hasNonNull("sensorStatus")) request.setSensorStatus(root.get("sensorStatus").asText());
        if (root.hasNonNull("dataQuality")) request.setDataQuality(root.get("dataQuality").asText());

        return request;
    }

    private Double parseDoubleField(JsonNode root, String fieldName) {
        if (root.has(fieldName) && !root.get(fieldName).isNull()) {
            JsonNode node = root.get(fieldName);
            if (node.isObject() && node.has("value") && !node.get("value").isNull()) {
                return node.get("value").asDouble();
            } else if (node.isNumber()) {
                return node.asDouble();
            }
        }
        return null;
    }
}
