ALTER TABLE billing_profile ADD COLUMN minimums JSONB[] NOT NULL DEFAULT ARRAY[]::jsonb[];