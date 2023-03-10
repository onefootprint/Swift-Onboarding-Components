ALTER TABLE task ALTER created_at TYPE TIMESTAMP USING created_at;
ALTER TABLE task ALTER _created_at TYPE TIMESTAMP USING _created_at;
ALTER TABLE task ALTER _updated_at TYPE TIMESTAMP USING _updated_at;
ALTER TABLE task ALTER scheduled_for TYPE TIMESTAMP USING scheduled_for;