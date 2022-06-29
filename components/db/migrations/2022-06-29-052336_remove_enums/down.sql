
alter table user_data drop constraint check_sh_data;
drop index user_data_unique_kind_fingerprint;
drop index user_data_unique_primary_data;
drop index user_data_user_vault_id_data_kind;
drop index user_data_fingerprint;

CREATE TYPE user_status as ENUM ('Verified', 'Processing', 'Incomplete', 'Failed', 'ManualReview');
ALTER TABLE user_vaults ALTER COLUMN id_verified TYPE user_status USING id_verified::user_status;
ALTER TABLE onboardings ALTER COLUMN status TYPE user_status USING status::user_status;

CREATE TYPE data_kind as ENUM ('FirstName', 'LastName', 'Dob', 'Ssn', 'StreetAddress', 'StreetAddress2', 'City', 'State', 'Zip', 'Country', 'Email', 'PhoneNumber', 'LastFourSsn');
ALTER TABLE ob_configurations ALTER COLUMN required_user_data DROP DEFAULT;
ALTER TABLE ob_configurations ALTER COLUMN required_user_data TYPE data_kind[] USING required_user_data::data_kind[];
ALTER TABLE ob_configurations ALTER COLUMN required_user_data SET DEFAULT 
    ARRAY[
        'FirstName', 
        'LastName', 
        'Dob', 
        'Ssn', 
        'StreetAddress', 
        'StreetAddress2', 
        'City', 
        'State', 
        'Zip', 
        'Country', 
        'Email', 
        'PhoneNumber'
    ]::data_kind[];
ALTER TABLE access_events ALTER COLUMN data_kinds TYPE data_kind[] USING data_kinds::data_kind[];
ALTER TABLE user_data ALTER COLUMN data_kind TYPE data_kind USING data_kind::data_kind;

CREATE TYPE data_priority as ENUM ('Primary', 'Secondary');
ALTER TABLE user_data ALTER COLUMN data_priority TYPE data_priority USING data_priority::data_priority;

CREATE TYPE attestation_type as ENUM ('None', 'Unknown', 'Apple', 'AppleApp', 'AndroidKey', 'AndroidSafetyNet');
ALTER TABLE webauthn_credentials ALTER COLUMN attestation_type DROP DEFAULT;
ALTER TABLE webauthn_credentials ALTER COLUMN attestation_type TYPE attestation_type USING attestation_type::attestation_type;
ALTER TABLE webauthn_credentials ALTER COLUMN attestation_type SET DEFAULT 'Unknown'::attestation_type;

alter table user_data add constraint check_sh_data CHECK (
        ((sh_data IS NOT NULL) AND (data_kind IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName')))
        OR ((sh_data IS NULL) AND (data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName')))
    );
create unique index if not exists user_data_unique_kind_fingerprint on user_data(data_kind, sh_data) where is_verified = TRUE and data_kind in ('Ssn', 'PhoneNumber', 'Email');
create unique index if not exists user_data_unique_primary_data on user_data(user_vault_id, data_kind) where deactivated_at is null and data_priority = 'Primary';
create index if not exists user_data_user_vault_id_data_kind on user_data(user_vault_id, data_kind);
create index if not exists user_data_fingerprint on user_data(sh_data) where sh_data is not null;