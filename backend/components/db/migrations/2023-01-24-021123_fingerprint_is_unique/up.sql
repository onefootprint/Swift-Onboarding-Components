ALTER TABLE fingerprint ADD COLUMN is_unique BOOL NOT NULL DEFAULT FALSE;
ALTER TABLE fingerprint ALTER COLUMN is_unique DROP DEFAULT;

CREATE UNIQUE INDEX ON fingerprint(kind, sh_data) WHERE is_unique;