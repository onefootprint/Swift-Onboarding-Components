ALTER TABLE access_event ALTER COLUMN reason DROP NOT NULL, ALTER COLUMN principal SET NOT NULL;
UPDATE access_event SET reason = NULL WHERE reason = '';