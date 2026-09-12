-- =========================================================
-- HoneyChain Migration V12: GNSS / GPS Telemetry Schema Upgrade
-- =========================================================
-- Adds 7th first-class sensor category: GNSS / GPS location tracking.

ALTER TABLE sensor_readings
ADD COLUMN IF NOT EXISTS altitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS position_accuracy DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS satellite_count INTEGER,
ADD COLUMN IF NOT EXISTS fix_status VARCHAR(32) DEFAULT 'NO_FIX',
ADD COLUMN IF NOT EXISTS gps_timestamp VARCHAR(64);
