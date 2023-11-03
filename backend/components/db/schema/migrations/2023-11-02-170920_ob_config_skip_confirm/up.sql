-- TODO drop default
ALTER TABLE ob_configuration ADD COLUMN skip_confirm BOOLEAN NOT NULL DEFAULT 'f';