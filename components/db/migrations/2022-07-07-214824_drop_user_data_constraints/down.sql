-- allow more flexibility in what is fingerprinted/not, control in app logic
alter table user_data add constraint check_sh_data check (
    ((sh_data IS NOT NULL) AND (data_kind IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
    OR ((sh_data IS NULL) AND (data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
);
drop index user_data_unique_kind_fingerprint;
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_kind_fingerprint ON user_data(data_kind, sh_data) WHERE is_verified = TRUE AND data_kind IN ('PhoneNumber', 'Email');
