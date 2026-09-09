-- HoneyChain Flyway Schema Migration V5
-- Phase 8: Blockchain Traceability & Smart Contract Anchoring

ALTER TABLE traceability_events
ADD COLUMN IF NOT EXISTS blockchain_status VARCHAR(32) DEFAULT 'NOT_CONFIGURED',
ADD COLUMN IF NOT EXISTS blockchain_transaction_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS blockchain_network VARCHAR(64),
ADD COLUMN IF NOT EXISTS blockchain_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS blockchain_data_hash VARCHAR(128);

COMMENT ON COLUMN traceability_events.blockchain_status IS 'Off-chain vs On-chain status: OFF_CHAIN_VERIFIED, PENDING, BLOCKCHAIN_ANCHORED, NOT_CONFIGURED, FAILED';
COMMENT ON COLUMN traceability_events.blockchain_transaction_hash IS 'On-chain EVM transaction hash reference';
COMMENT ON COLUMN traceability_events.blockchain_data_hash IS 'Deterministic SHA-256 canonical event hash anchored on-chain';
