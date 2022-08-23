ALTER TABLE access_event ADD COLUMN data_kinds TEXT[] NOT NULL DEFAULT CAST(ARRAY[] AS TEXT[]);

ALTER TABLE access_event ALTER COLUMN data_kinds DROP DEFAULT;

CREATE INDEX IF NOT EXISTS access_events_scoped_user_id_data_kind ON access_event(scoped_user_id, data_kinds);
