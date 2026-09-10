-- V6__phase16_alert_management.sql
-- Add read/unread state, acknowledgment state, alert type, model version, and batch ID to ai_alerts table

ALTER TABLE ai_alerts
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS is_acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS acknowledged_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS alert_type VARCHAR(50) DEFAULT 'TELEMETRY_ANOMALY' NOT NULL,
    ADD COLUMN IF NOT EXISTS model_version VARCHAR(50) DEFAULT 'honeychain-anomaly-v1',
    ADD COLUMN IF NOT EXISTS batch_id VARCHAR(60);

CREATE INDEX IF NOT EXISTS idx_ai_alerts_read ON ai_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_acknowledged ON ai_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_hive_status ON ai_alerts(hive_id, status);
