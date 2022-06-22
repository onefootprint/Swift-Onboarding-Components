ALTER TABLE onboardings ADD COLUMN start_timestamp timestamp;
UPDATE onboardings SET start_timestamp = created_at;
ALTER TABLE onboardings ALTER COLUMN start_timestamp SET NOT NULL;