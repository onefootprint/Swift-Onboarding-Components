UPDATE access_event SET reason = '' WHERE reason IS NULL;
ALTER TABLE access_event ALTER COLUMN reason SET NOT NULL, ALTER COLUMN principal DROP NOT NULL;