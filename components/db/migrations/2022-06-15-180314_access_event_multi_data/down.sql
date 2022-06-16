ALTER TABLE access_events ADD COLUMN data_kind Data_kind;
UPDATE access_events SET data_kind = data_kinds[1];
ALTER TABLE access_events ALTER COLUMN data_kind SET NOT NULL;
ALTER TABLE access_events DROP COLUMN data_kinds;