-- TODO rm default and backfill
ALTER TABLE scoped_vault ADD COLUMN last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now();