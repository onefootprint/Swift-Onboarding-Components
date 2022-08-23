ALTER TABLE access_event ADD COLUMN kind TEXT NOT NULL DEFAULT 'decrypt';
ALTER TABLE access_event ADD COLUMN targets TEXT[] NOT NULL DEFAULT CAST(ARRAY[] as TEXT[]);

ALTER TABLE access_event
    ALTER COLUMN kind DROP DEFAULT,
    ALTER COLUMN targets DROP DEFAULT;

CREATE INDEX IF NOT EXISTS access_events_scoped_user_id_targets ON access_event(scoped_user_id, targets);