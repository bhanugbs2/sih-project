package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreateSensorReadingRequest;
import com.nexora.honeychain.dto.SensorReadingResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MqttTelemetryIngestionService {

    private static final Logger log = LoggerFactory.getLogger(MqttTelemetryIngestionService.class);

    private final SensorAdapterService sensorAdapterService;
    private final SensorReadingService sensorReadingService;
    private final IoTGatewayService gatewayService;

    public MqttTelemetryIngestionService(
            SensorAdapterService sensorAdapterService,
            SensorReadingService sensorReadingService,
            IoTGatewayService gatewayService
    ) {
        this.sensorAdapterService = sensorAdapterService;
        this.sensorReadingService = sensorReadingService;
        this.gatewayService = gatewayService;
    }

    /**
     * Ingests MQTT telemetry payload received from Raspberry Pi 5 Edge Gateway topic:
     * honeychain/{farmId}/{apiaryId}/{hiveId}/telemetry
     */
    public SensorReadingResponse processMqttTelemetryMessage(String topic, String payload, String gatewayId) {
        log.info("Processing MQTT telemetry message from topic: {}, gateway: {}", topic, gatewayId);
        try {
            CreateSensorReadingRequest request = sensorAdapterService.normalizeTelemetryPayload(payload);
            
            // Extract hiveId from topic if not present in request
            if (topic != null && topic.contains("/")) {
                String[] parts = topic.split("/");
                if (parts.length >= 4 && (request.getHiveId() == null || request.getHiveId().isEmpty())) {
                    request.setHiveId(parts[3]);
                }
            }

            // Record sensor reading entity + trigger AI evaluation
            SensorReadingResponse response = sensorReadingService.recordSensorReading(request);

            // Update gateway heartbeat & last telemetry timestamp
            if (gatewayId != null && !gatewayId.isEmpty()) {
                gatewayService.recordHeartbeat(gatewayId, null, "ONLINE");
            }

            return response;
        } catch (Exception e) {
            log.error("Failed to process MQTT telemetry payload on topic: {}", topic, e);
            throw new IllegalArgumentException("Invalid MQTT telemetry payload: " + e.getMessage(), e);
        }
    }
}
