-- TODO rm default
ALTER TABLE scoped_vault ADD column is_active BOOLEAN NOT NULL DEFAULT 't';