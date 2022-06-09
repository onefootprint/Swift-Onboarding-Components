/* drop all constraints and indexes relating to data_kind */ 
alter table user_data drop constraint check_sh_data;
drop index user_data_unique_kind_fingerprint;
drop index user_data_unique_primary_data;
drop index user_data_user_vault_id_data_kind;

/* tenant scoped attributes will move to onboardings model, so just drop here */
alter table tenants drop column required_data;

/* cast existing tables that use data kind to text */
alter table user_data alter column data_kind type text;
alter table access_events alter column data_kind type text;

/* cast data_kind to text, drop data_kind, declare new enum with last four ssn, and re-cast */
drop type data_kind;
create type data_kind as ENUM(
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
     'PhoneNumber',
     'LastFourSsn'
);
alter table user_data alter column data_kind type data_kind using data_kind::data_kind;
alter table access_events alter column data_kind type data_kind using data_kind::data_kind;

/* add back constraints and indexes */
alter table user_data add constraint check_sh_data CHECK (
        ((sh_data IS NOT NULL) AND (data_kind IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
        OR ((sh_data IS NULL) AND (data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
    );
create unique index if not exists user_data_unique_kind_fingerprint on user_data(data_kind, sh_data) where is_verified = TRUE and data_kind in ('Ssn', 'PhoneNumber', 'Email');
create unique index if not exists user_data_unique_primary_data on user_data(user_vault_id, data_kind) where deactivated_at is null and data_priority = 'Primary';
create index if not exists user_data_user_vault_id_data_kind on user_data(user_vault_id, data_kind);
create index if not exists user_data_fingerprint on user_data(sh_data) where sh_data is not null;
