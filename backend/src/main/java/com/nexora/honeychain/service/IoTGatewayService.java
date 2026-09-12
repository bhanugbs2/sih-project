package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.CreateGatewayRequest;
import com.nexora.honeychain.dto.FleetSummaryResponse;
import com.nexora.honeychain.dto.GatewayResponse;
import com.nexora.honeychain.model.IoTGatewayDevice;
import com.nexora.honeychain.repository.IoTGatewayDeviceRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class IoTGatewayService {

    private final IoTGatewayDeviceRepository gatewayRepository;

    public IoTGatewayService(IoTGatewayDeviceRepository gatewayRepository) {
        this.gatewayRepository = gatewayRepository;
    }

    @PostConstruct
    @Transactional
    public void initDefaultGateways() {
        if (gatewayRepository.count() == 0) {
            IoTGatewayDevice pi5Gateway = new IoTGatewayDevice(
                    "GW-PI5-HIM-001",
                    "Raspberry Pi 5 Edge IoT Gateway - Apiary Alpha",
                    "FARM-HIM-001",
                    "APIARY-HIM-A",
                    "HIVE-HIM-001",
                    "Raspberry Pi 5 Model B (8GB)",
                    "v2.4.0-industrial",
                    "ONLINE",
                    "MAINS_OPERATIONAL",
                    "192.168.0.144"
            );
            pi5Gateway.setLastSeen(Instant.now());
            pi5Gateway.setLastTelemetryTimestamp(Instant.now());
            gatewayRepository.save(pi5Gateway);

            IoTGatewayDevice esp32Gateway = new IoTGatewayDevice(
                    "GW-ESP32-DEMO-001",
                    "ESP32 Physical Prototype Node",
                    "FARM-HIM-001",
                    "APIARY-HIM-A",
                    "HIVE-HIM-002",
                    "ESP32-WROOM-32 (Dual Core)",
                    "v1.2.0-prototype",
                    "ONLINE",
                    "BATTERY_OK",
                    "192.168.0.145"
            );
            esp32Gateway.setLastSeen(Instant.now().minusSeconds(120));
            esp32Gateway.setLastTelemetryTimestamp(Instant.now().minusSeconds(120));
            gatewayRepository.save(esp32Gateway);
        }
    }

    @Transactional
    public GatewayResponse registerOrUpdateGateway(CreateGatewayRequest request) {
        IoTGatewayDevice device = gatewayRepository.findByGatewayId(request.getGatewayId())
                .orElseGet(() -> {
                    IoTGatewayDevice newDevice = new IoTGatewayDevice();
                    newDevice.setGatewayId(request.getGatewayId());
                    return newDevice;
                });

        device.setName(request.getName());
        device.setFarmId(request.getFarmId());
        device.setApiaryId(request.getApiaryId());
        device.setHiveId(request.getHiveId());
        device.setHardwareVersion(request.getHardwareVersion());
        device.setFirmwareVersion(request.getFirmwareVersion());
        if (request.getStatus() != null) device.setStatus(request.getStatus());
        if (request.getPowerStatus() != null) device.setPowerStatus(request.getPowerStatus());
        if (request.getIpAddress() != null) device.setIpAddress(request.getIpAddress());
        device.setLastSeen(Instant.now());

        IoTGatewayDevice saved = gatewayRepository.save(device);
        return toGatewayResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GatewayResponse> getAllGateways() {
        return gatewayRepository.findAll().stream()
                .map(this::toGatewayResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GatewayResponse getGatewayById(String gatewayId) {
        IoTGatewayDevice device = gatewayRepository.findByGatewayId(gatewayId)
                .orElseThrow(() -> new IllegalArgumentException("Gateway not found: " + gatewayId));
        return toGatewayResponse(device);
    }

    @Transactional(readOnly = true)
    public FleetSummaryResponse getFleetSummary() {
        long total = gatewayRepository.count();
        long online = gatewayRepository.countByStatus("ONLINE");
        long offline = gatewayRepository.countByStatus("OFFLINE");
        long degraded = gatewayRepository.countByStatus("DEGRADED");
        long maintenance = gatewayRepository.countByStatus("MAINTENANCE");

        return new FleetSummaryResponse(total, online, offline, degraded, maintenance);
    }

    @Transactional
    public void recordHeartbeat(String gatewayId, String ipAddress, String powerStatus) {
        gatewayRepository.findByGatewayId(gatewayId).ifPresent(device -> {
            device.setLastSeen(Instant.now());
            if (ipAddress != null) device.setIpAddress(ipAddress);
            if (powerStatus != null) device.setPowerStatus(powerStatus);
            if ("OFFLINE".equalsIgnoreCase(device.getStatus())) {
                device.setStatus("ONLINE");
            }
            gatewayRepository.save(device);
        });
    }

    private GatewayResponse toGatewayResponse(IoTGatewayDevice device) {
        return new GatewayResponse(
                device.getId(),
                device.getGatewayId(),
                device.getName(),
                device.getFarmId(),
                device.getApiaryId(),
                device.getHiveId(),
                device.getHardwareVersion(),
                device.getFirmwareVersion(),
                device.getStatus(),
                device.getPowerStatus(),
                device.getIpAddress(),
                device.getLastSeen(),
                device.getLastTelemetryTimestamp(),
                device.getCreatedAt()
        );
    }
}
