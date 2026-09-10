-- HoneyChain Schema Alignment Migration V7
-- Align hives, quality_tests, and processing_records tables with JPA Entity definitions

DO $$ 
BEGIN
    -- 1. Hives Table Alignment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='created_at') THEN
        ALTER TABLE hives ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        UPDATE hives SET created_at = installed_at WHERE created_at IS NULL AND installed_at IS NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='hive_id') THEN
        ALTER TABLE hives ADD COLUMN hive_id VARCHAR(60);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='hive_code') THEN
            UPDATE hives SET hive_id = hive_code WHERE hive_id IS NULL;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='hive_id_new') THEN
            UPDATE hives SET hive_id = hive_id_new WHERE hive_id IS NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='location') THEN
        ALTER TABLE hives ADD COLUMN location VARCHAR(150);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='apiary_location') THEN
            UPDATE hives SET location = apiary_location WHERE location IS NULL;
        END IF;
    END IF;

    -- 2. Quality Tests Table Alignment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='moisture') THEN
        ALTER TABLE quality_tests ADD COLUMN moisture DOUBLE PRECISION;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='moisture_content') THEN
            UPDATE quality_tests SET moisture = moisture_content WHERE moisture IS NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='ph') THEN
        ALTER TABLE quality_tests ADD COLUMN ph DOUBLE PRECISION;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='ph_level') THEN
            UPDATE quality_tests SET ph = ph_level WHERE ph IS NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='color') THEN
        ALTER TABLE quality_tests ADD COLUMN color VARCHAR(50) DEFAULT 'GOLDEN';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='result') THEN
        ALTER TABLE quality_tests ADD COLUMN result VARCHAR(30) DEFAULT 'PASSED';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='verified_by') THEN
        ALTER TABLE quality_tests ADD COLUMN verified_by VARCHAR(100);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='tested_by') THEN
            UPDATE quality_tests SET verified_by = tested_by WHERE verified_by IS NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='timestamp') THEN
        ALTER TABLE quality_tests ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='tested_at') THEN
            UPDATE quality_tests SET timestamp = tested_at WHERE timestamp IS NULL AND tested_at IS NOT NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_tests' AND column_name='created_at') THEN
        ALTER TABLE quality_tests ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- 3. Processing Records Table Alignment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='process_type') THEN
        ALTER TABLE processing_records ADD COLUMN process_type VARCHAR(50);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='processing_type') THEN
            UPDATE processing_records SET process_type = processing_type WHERE process_type IS NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='description') THEN
        ALTER TABLE processing_records ADD COLUMN description VARCHAR(1000);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='verified_by') THEN
        ALTER TABLE processing_records ADD COLUMN verified_by VARCHAR(100);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='operator') THEN
            UPDATE processing_records SET verified_by = operator WHERE verified_by IS NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='timestamp') THEN
        ALTER TABLE processing_records ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='processed_at') THEN
            UPDATE processing_records SET timestamp = processed_at WHERE timestamp IS NULL AND processed_at IS NOT NULL;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='processing_records' AND column_name='created_at') THEN
        ALTER TABLE processing_records ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

END $$;
