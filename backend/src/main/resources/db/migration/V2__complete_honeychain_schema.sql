-- HoneyChain Complete Data Foundation Schema Migration (SIH26021 - Nexora)
-- Flyway Migration V2

-- 1. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    id VARCHAR(36) PRIMARY KEY,
    farm_id VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hives Table Adjustments / Creation
CREATE TABLE IF NOT EXISTS hives_v2 (
    id VARCHAR(36) PRIMARY KEY,
    hive_id VARCHAR(60) NOT NULL UNIQUE,
    farm_id VARCHAR(36) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing hives if any into hives_v2 format or align hives table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='farm_id') THEN
        -- Add farm_id column and hive_id mapping to existing hives table
        ALTER TABLE hives ADD COLUMN IF NOT EXISTS farm_id VARCHAR(36) REFERENCES farms(id) ON DELETE CASCADE;
        ALTER TABLE hives ADD COLUMN IF NOT EXISTS hive_id_new VARCHAR(60);
        UPDATE hives SET hive_id_new = hive_code WHERE hive_id_new IS NULL;
        ALTER TABLE hives ADD COLUMN IF NOT EXISTS name VARCHAR(100) DEFAULT 'Main Hive';
        ALTER TABLE hives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 3. Sensor Readings Table (High Frequency Telemetry)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id VARCHAR(36) PRIMARY KEY,
    hive_id VARCHAR(36) NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    temperature DOUBLE PRECISION, -- Nullable on sensor failure
    humidity DOUBLE PRECISION CONSTRAINT chk_humidity CHECK (humidity IS NULL OR (humidity >= 0 AND humidity <= 100)),
    weight DOUBLE PRECISION CONSTRAINT chk_weight CHECK (weight IS NULL OR weight >= 0),
    sound_level DOUBLE PRECISION CONSTRAINT chk_sound_level CHECK (sound_level IS NULL OR sound_level >= 0),
    latitude DOUBLE PRECISION CONSTRAINT chk_sr_lat CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    longitude DOUBLE PRECISION CONSTRAINT chk_sr_lng CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Composite Index for Efficient Time Series Telemetry Queries
CREATE INDEX IF NOT EXISTS idx_sensor_reading_hive_timestamp ON sensor_readings(hive_id, timestamp DESC);

-- 4. AI Alerts Table
CREATE TABLE IF NOT EXISTS ai_alerts (
    id VARCHAR(36) PRIMARY KEY,
    hive_id VARCHAR(36) NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    risk_score DOUBLE PRECISION NOT NULL CONSTRAINT chk_risk_score CHECK (risk_score >= 0 AND risk_score <= 100),
    status VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    message VARCHAR(500) NOT NULL,
    factors VARCHAR(1000),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_alerts_hive ON ai_alerts(hive_id, timestamp DESC);

-- 5. Align / Ensure Honey Batches Columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='honey_batches' AND column_name='batch_id') THEN
        ALTER TABLE honey_batches ADD COLUMN IF NOT EXISTS batch_id VARCHAR(60);
        UPDATE honey_batches SET batch_id = batch_code WHERE batch_id IS NULL;
        ALTER TABLE honey_batches ADD CONSTRAINT uq_honey_batches_batch_id UNIQUE (batch_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='honey_batches' AND column_name='quantity') THEN
        ALTER TABLE honey_batches ADD COLUMN IF NOT EXISTS quantity DOUBLE PRECISION DEFAULT 100.0;
        ALTER TABLE honey_batches ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'kg';
        ALTER TABLE honey_batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 6. Packages Table
CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(36) PRIMARY KEY,
    package_id VARCHAR(60) NOT NULL UNIQUE,
    batch_id VARCHAR(36) NOT NULL REFERENCES honey_batches(id) ON DELETE CASCADE,
    qr_url VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    packaging_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packages_batch ON packages(batch_id);

-- 7. Traceability Events Table
CREATE TABLE IF NOT EXISTS traceability_events (
    id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) NOT NULL REFERENCES honey_batches(id) ON DELETE CASCADE,
    package_id VARCHAR(36) REFERENCES packages(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    blockchain_reference VARCHAR(255),
    environment VARCHAR(30) NOT NULL DEFAULT 'DEVELOPMENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_traceability_events_batch ON traceability_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_traceability_events_package ON traceability_events(package_id);
