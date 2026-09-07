-- HoneyChain Initial Database Schema (SIH26021 - Nexora)
-- PostgreSQL + Flyway Migration V1

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hives Table
CREATE TABLE IF NOT EXISTS hives (
    id VARCHAR(36) PRIMARY KEY,
    hive_code VARCHAR(50) NOT NULL UNIQUE,
    apiary_location VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_ping TIMESTAMP WITH TIME ZONE
);

-- 3. IoT Telemetry Logs Table
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id VARCHAR(36) PRIMARY KEY,
    hive_id VARCHAR(36) NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    temperature DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    acoustic_frequency_hz DOUBLE PRECISION,
    battery_level DOUBLE PRECISION,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Honey Batches Table
CREATE TABLE IF NOT EXISTS honey_batches (
    id VARCHAR(36) PRIMARY KEY,
    batch_code VARCHAR(60) NOT NULL UNIQUE,
    hive_id VARCHAR(36) REFERENCES hives(id),
    floral_source VARCHAR(100) NOT NULL,
    harvest_date DATE NOT NULL,
    harvest_weight_kg DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'HARVESTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Quality Tests Table
CREATE TABLE IF NOT EXISTS quality_tests (
    id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL REFERENCES honey_batches(id) ON DELETE CASCADE,
    moisture_content DOUBLE PRECISION NOT NULL,
    ph_level DOUBLE PRECISION NOT NULL,
    hmf_value DOUBLE PRECISION NOT NULL, -- Hydroxymethylfurfural
    diastase_number DOUBLE PRECISION NOT NULL,
    purity_score DOUBLE PRECISION NOT NULL,
    adulteration_status VARCHAR(30) NOT NULL DEFAULT 'PURE',
    tested_by VARCHAR(100),
    tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Processing Records Table
CREATE TABLE IF NOT EXISTS processing_records (
    id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL REFERENCES honey_batches(id) ON DELETE CASCADE,
    facility_name VARCHAR(100) NOT NULL,
    processing_type VARCHAR(50) NOT NULL,
    temperature_celsius DOUBLE PRECISION,
    filtered_microns INTEGER,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Package Tracking Table
CREATE TABLE IF NOT EXISTS package_tracking (
    id VARCHAR(36) PRIMARY KEY,
    qr_code_id VARCHAR(100) NOT NULL UNIQUE,
    batch_id VARCHAR(36) NOT NULL REFERENCES honey_batches(id),
    package_size_grams INTEGER NOT NULL,
    packaging_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    distributor_id VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'PACKAGED'
);

-- 8. Blockchain Transactions Audit Table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) REFERENCES honey_batches(id),
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT,
    contract_address VARCHAR(42) NOT NULL,
    merkle_root VARCHAR(66) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    anchored_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_telemetry_hive ON telemetry_logs(hive_id);
CREATE INDEX IF NOT EXISTS idx_batches_hive ON honey_batches(hive_id);
CREATE INDEX IF NOT EXISTS idx_quality_batch ON quality_tests(batch_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_batch ON blockchain_transactions(batch_id);
