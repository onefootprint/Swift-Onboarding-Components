ALTER TABLE ob_configuration ADD COLUMN optional_data TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE ob_configuration ALTER COLUMN optional_data DROP DEFAULT;
