-- HoneyChain Schema Migration V8
-- Drop legacy NOT NULL constraints on columns not managed by JPA entities

DO $$ 
BEGIN
    -- 1. Hives Table
    ALTER TABLE hives ALTER COLUMN hive_code DROP NOT NULL;
    ALTER TABLE hives ALTER COLUMN apiary_location DROP NOT NULL;

    -- 2. Quality Tests Table
    ALTER TABLE quality_tests ALTER COLUMN moisture_content DROP NOT NULL;
    ALTER TABLE quality_tests ALTER COLUMN ph_level DROP NOT NULL;
    ALTER TABLE quality_tests ALTER COLUMN hmf_value DROP NOT NULL;
    ALTER TABLE quality_tests ALTER COLUMN diastase_number DROP NOT NULL;
    ALTER TABLE quality_tests ALTER COLUMN purity_score DROP NOT NULL;

    -- 3. Processing Records Table
    ALTER TABLE processing_records ALTER COLUMN facility_name DROP NOT NULL;
    ALTER TABLE processing_records ALTER COLUMN processing_type DROP NOT NULL;

    -- 4. Honey Batches Table
    ALTER TABLE honey_batches ALTER COLUMN floral_source DROP NOT NULL;
    ALTER TABLE honey_batches ALTER COLUMN harvest_weight_kg DROP NOT NULL;

END $$;
