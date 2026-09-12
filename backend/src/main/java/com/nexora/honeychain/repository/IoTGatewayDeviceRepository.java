package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.IoTGatewayDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IoTGatewayDeviceRepository extends JpaRepository<IoTGatewayDevice, String> {
    Optional<IoTGatewayDevice> findByGatewayId(String gatewayId);
    List<IoTGatewayDevice> findByFarmId(String farmId);
    List<IoTGatewayDevice> findByStatus(String status);
    long countByStatus(String status);
}

