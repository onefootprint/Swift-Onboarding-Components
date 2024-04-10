-- From postgres documentation:

-- SET NOT NULL may only be applied to a column provided none of the records in the table contain a NULL value for the column. Ordinarily this is checked during the ALTER TABLE by scanning the entire table; however, if a valid CHECK constraint is found which proves no NULL can exist, then the table scan is skipped.

-- So, in order to safely mark these columns as not null without taking a table lock for a long time, we need to
-- (1) add a check constraint NOT VALID
-- (2) validate the check constraint
-- (3) mark the column as NOT NULL
-- (4) drop the check constraint


-- These ADD CONSTRAINT NOT VALID statements will take a lock, but only for a short time
ALTER TABLE fingerprint
    ADD CONSTRAINT scoped_vault_id_not_null CHECK(scoped_vault_id IS NOT NULL) NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT vault_id_not_null CHECK(vault_id IS NOT NULL) NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT tenant_id_not_null CHECK(tenant_id IS NOT NULL) NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT is_live_not_null CHECK(is_live IS NOT NULL) NOT VALID;