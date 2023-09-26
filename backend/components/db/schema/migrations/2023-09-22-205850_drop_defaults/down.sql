ALTER TABLE incode_verification_session ALTER COLUMN ignored_failure_reasons SET DEFAULT CAST(ARRAY[] AS TEXT[]);
ALTER TABLE vault_data ALTER COLUMN format SET DEFAULT 'string';