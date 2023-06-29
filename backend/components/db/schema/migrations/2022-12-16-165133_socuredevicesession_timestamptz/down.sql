ALTER TABLE socure_device_session ALTER created_at TYPE TIMESTAMP USING created_at;
ALTER TABLE socure_device_session ALTER _created_at TYPE TIMESTAMP USING _created_at;
ALTER TABLE socure_device_session ALTER _updated_at TYPE TIMESTAMP USING _updated_at;