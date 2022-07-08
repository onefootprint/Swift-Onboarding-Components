-- allow more flexibility in what is fingerprinted/not, control in app logic
alter table user_data drop constraint check_sh_data;
-- per our identity vendors, ssns don't have to be unique
drop index user_data_unique_kind_fingerprint;
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_kind_fingerprint ON user_data(data_kind, sh_data) WHERE is_verified = TRUE AND data_kind IN ('PhoneNumber', 'Email');
