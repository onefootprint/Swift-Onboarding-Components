ALTER TABLE access_event
    -- I already added these in prod
    ADD COLUMN IF NOT EXISTS tenant_id TEXT,
    ADD COLUMN IF NOT EXISTS is_live BOOL;
