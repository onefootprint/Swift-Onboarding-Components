-- TODO drop default

ALTER TABLE vault_data
    ADD COLUMN format TEXT NOT NULL DEFAULT 'string';

COMMIT;

-- In a separate txn, backfill a few of these values
BEGIN;
UPDATE vault_data
SET format = 'json'
WHERE kind = 'id.citizenships';