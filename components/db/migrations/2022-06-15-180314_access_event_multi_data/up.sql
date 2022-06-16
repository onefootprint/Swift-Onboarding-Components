ALTER TABLE access_events ADD COLUMN data_kinds Data_kind[];
UPDATE access_events SET data_kinds = Array[data_kind];
ALTER TABLE access_events ALTER COLUMN data_kinds SET NOT NULL;
ALTER TABLE access_events DROP COLUMN data_kind;