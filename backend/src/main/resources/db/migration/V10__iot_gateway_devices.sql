-- HoneyChain Flyway Migration V10: Industrial IoT Gateway Devices
-- Adds iot_gateway_devices table for Raspberry Pi 5 Edge IoT Gateways and physical node management

CREATE TABLE IF NOT EXISTS iot_gateway_devices (
    id VARCHAR(36) PRIMARY KEY,
    gateway_id VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    farm_id VARCHAR(36),
    apiary_id VARCHAR(60),
    hive_id VARCHAR(60),
    hardware_version VARCHAR(100) NOT NULL,
    firmware_version VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ONLINE',
    power_status VARCHAR(50),
    ip_address VARCHAR(50),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_telemetry_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gateway_status ON iot_gateway_devices(status);
