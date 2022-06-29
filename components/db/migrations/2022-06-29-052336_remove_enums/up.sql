ALTER TABLE user_vaults ALTER COLUMN id_verified TYPE text;
ALTER TABLE onboardings ALTER COLUMN status TYPE text;
DROP TYPE user_status;

ALTER TABLE ob_configurations ALTER COLUMN required_user_data TYPE text[] USING required_user_data::text[];
-- TODO maybe don't want a DB default for this
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
    ];

ALTER TABLE access_events ALTER COLUMN data_kinds TYPE text[] USING data_kinds::text[];
ALTER TABLE user_data RENAME COLUMN data_kind TO _data_kind;
ALTER TABLE user_data ADD COLUMN data_kind text;
UPDATE user_data SET data_kind = _data_kind::text;
ALTER TABLE user_data ALTER COLUMN data_kind SET NOT NULL;
ALTER TABLE user_data DROP COLUMN _data_kind;
DROP TYPE data_kind;

ALTER TABLE user_data RENAME COLUMN data_priority TO _data_priority;
ALTER TABLE user_data ADD COLUMN data_priority text;
UPDATE user_data SET data_priority = _data_priority::text;
ALTER TABLE user_data ALTER COLUMN data_priority SET NOT NULL;
ALTER TABLE user_data DROP COLUMN _data_priority;
DROP TYPE data_priority;


ALTER TABLE webauthn_credentials ALTER COLUMN attestation_type TYPE text;
ALTER TABLE webauthn_credentials ALTER COLUMN attestation_type SET DEFAULT 'Unknown';
DROP TYPE attestation_type;

-- Re-add the indexes that were removed when we dropped the _data_kind and _data_priority columns
alter table user_data add constraint check_sh_data CHECK (
        ((sh_data IS NOT NULL) AND (data_kind IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
        OR ((sh_data IS NULL) AND (data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
    );
create unique index if not exists user_data_unique_kind_fingerprint on user_data(data_kind, sh_data) where is_verified = TRUE and data_kind in ('Ssn', 'PhoneNumber', 'Email');
create unique index if not exists user_data_unique_primary_data on user_data(user_vault_id, data_kind) where deactivated_at is null and data_priority = 'Primary';
create index if not exists user_data_user_vault_id_data_kind on user_data(user_vault_id, data_kind);
create index if not exists user_data_fingerprint on user_data(sh_data) where sh_data is not null;