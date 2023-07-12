CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- This index makes ilike operations very efficient, which we use to search p_data columns
CREATE INDEX IF NOT EXISTS vault_data_p_data ON vault_data USING gin(p_data gin_trgm_ops);