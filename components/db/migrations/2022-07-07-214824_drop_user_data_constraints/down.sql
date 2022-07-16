-- Un-fingerprint data in order to roll back to the old constraint
UPDATE user_data SET sh_data = NULL WHERE data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn');

ALTER TABLE user_data ADD CONSTRAINT check_sh_data CHECK (
    ((sh_data IS NOT NULL) AND (data_kind IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
    OR ((sh_data IS NULL) AND (data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
);
DROP INDEX user_data_unique_kind_fingerprint;
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_kind_fingerprint ON user_data(data_kind, sh_data) WHERE is_verified = TRUE AND data_kind IN ('PhoneNumber', 'Email');
