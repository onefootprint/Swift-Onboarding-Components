ALTER TABLE socure_device_session ALTER created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
ALTER TABLE socure_device_session ALTER _created_at TYPE TIMESTAMPTZ USING _created_at AT TIME ZONE 'UTC';
ALTER TABLE socure_device_session ALTER _updated_at TYPE TIMESTAMPTZ USING _updated_at AT TIME ZONE 'UTC';