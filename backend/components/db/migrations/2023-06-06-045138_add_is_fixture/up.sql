ALTER TABLE vault ADD COLUMN is_fixture BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE vault ALTER COLUMN is_fixture DROP DEFAULT;