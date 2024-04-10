-- TODO(eforde) before merging: should run this migration and the previous in prod manually and trick diesel into not running.
-- This will take too long and will time out most definitely

-- These VALIDATE CONSTRAINT statements will take a sharable lock (and not block inserts/updates), but these statements will take a long time to run
ALTER TABLE fingerprint
    VALIDATE CONSTRAINT scoped_vault_id_not_null;
ALTER TABLE fingerprint
    VALIDATE CONSTRAINT vault_id_not_null;
ALTER TABLE fingerprint
    VALIDATE CONSTRAINT tenant_id_not_null;
ALTER TABLE fingerprint
    VALIDATE CONSTRAINT is_live_not_null;