-- HoneyChain Flyway Migration V11: Industrial Multi-Sensor Telemetry Schema Expansion
-- Adds columns for Sensirion SHT4x (Internal Temp & Humidity), Sensirion SCD30 (CO2),
-- Industrial Load Cell (Weight), MEMS Microphone (Acoustics), and 3-Axis Accelerometer (Vibration X/Y/Z/Magnitude).

ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS internal_temperature_c DOUBLE PRECISION;
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS internal_humidity_rh DOUBLE PRECISION CONSTRAINT chk_int_humidity CHECK (internal_humidity_rh IS NULL OR (internal_humidity_rh >= 0 AND internal_humidity_rh <= 100));
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS weight_kg DOUBLE PRECISION CONSTRAINT chk_weight_kg CHECK (weight_kg IS NULL OR weight_kg >= 0);
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS co2_ppm DOUBLE PRECISION CONSTRAINT chk_co2_ppm CHECK (co2_ppm IS NULL OR co2_ppm >= 0);

ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS acoustic_level DOUBLE PRECISION CONSTRAINT chk_ac_level CHECK (acoustic_level IS NULL OR acoustic_level >= 0);
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS acoustic_rms DOUBLE PRECISION CONSTRAINT chk_ac_rms CHECK (acoustic_rms IS NULL OR acoustic_rms >= 0);
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS acoustic_activity DOUBLE PRECISION CONSTRAINT chk_ac_act CHECK (acoustic_activity IS NULL OR (acoustic_activity >= 0 AND acoustic_activity <= 1));

ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS vibration_x DOUBLE PRECISION;
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS vibration_y DOUBLE PRECISION;
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS vibration_z DOUBLE PRECISION;
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS vibration_magnitude DOUBLE PRECISION CONSTRAINT chk_vib_mag CHECK (vibration_magnitude IS NULL OR vibration_magnitude >= 0);

ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS sensor_status VARCHAR(50) DEFAULT 'GOOD';
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS data_quality VARCHAR(50) DEFAULT 'GOOD';

-- Ensure Index for Time-Series Queries
CREATE INDEX IF NOT EXISTS idx_sensor_reading_hive_time_multi ON sensor_readings(hive_id, timestamp DESC);
