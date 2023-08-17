ALTER TABLE ob_configuration ADD COLUMN is_no_phone_flow BOOL NOT NULL DEFAULT False;
ALTER TABLE ob_configuration ALTER COLUMN is_no_phone_flow DROP DEFAULT;
