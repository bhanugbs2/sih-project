-- HoneyChain Phase 7 Workflow Migration
-- Flyway Migration V4

DO $$ 
BEGIN
    -- 1. Extend honey_batches table for Phase 7
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='honey_batches' AND column_name='harvest_notes') THEN
        ALTER TABLE honey_batches ADD COLUMN harvest_notes VARCHAR(1000);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='honey_batches' AND column_name='quantity_source') THEN
        ALTER TABLE honey_batches ADD COLUMN quantity_source VARCHAR(255) DEFAULT 'Manual Harvest Quantity';
    END IF;

    -- 2. Extend quality_tests table for Phase 7
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='notes') THEN
        ALTER TABLE quality_tests ADD COLUMN notes VARCHAR(1000);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='tested_at') THEN
        ALTER TABLE quality_tests ADD COLUMN tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- 3. Extend processing_records table for Phase 7
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='operation') THEN
        ALTER TABLE processing_records ADD COLUMN operation VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='operator') THEN
        ALTER TABLE processing_records ADD COLUMN operator VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='started_at') THEN
        ALTER TABLE processing_records ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='completed_at') THEN
        ALTER TABLE processing_records ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='processing_temperature') THEN
        ALTER TABLE processing_records ADD COLUMN processing_temperature DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='temp_source') THEN
        ALTER TABLE processing_records ADD COLUMN temp_source VARCHAR(255) DEFAULT 'Manual Processing Temperature';
    END IF;
END $$;
