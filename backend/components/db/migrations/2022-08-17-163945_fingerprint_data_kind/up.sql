
ALTER TABLE fingerprint
    ADD COLUMN data_kind TEXT,
    ADD COLUMN is_unique BOOLEAN;

DELETE FROM fingerprint where data_kind IS NULL;
UPDATE fingerprint SET is_unique = False;

ALTER TABLE fingerprint
    ALTER COLUMN data_kind SET NOT NULL,
    ALTER COLUMN is_unique SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS fingerprint_sh_data_unique ON fingerprint(sh_data, data_kind) WHERE deactivated_at IS NULL AND is_unique = True;