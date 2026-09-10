-- HoneyChain Schema Migration V9
-- Drop NOT NULL constraint on honey_batches.batch_code for JPA entity compatibility

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='honey_batches' AND column_name='batch_code') THEN
        ALTER TABLE honey_batches ALTER COLUMN batch_code DROP NOT NULL;
    END IF;
END $$;
