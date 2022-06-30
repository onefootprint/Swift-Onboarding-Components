create table ob_configurations (
    id varchar(250) primary key default prefixed_uid('ob_config_id_'),
    key varchar(250) unique not null default prefixed_uid('ob_config_pk_'),
    name varchar(250) not null,
    description varchar(250),
    tenant_id varchar(250) not null,
    _created_at timestamp not null default now(),
    _updated_at timestamp not null default now(),
    required_user_data text [] not null default ARRAY[
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
    ],
    /* abstract configuration data for flexibility? */
    settings jsonb not null default '{}',
    is_disabled boolean not null default false,
    CONSTRAINT fk_ob_configurations_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS ob_configurations_key ON ob_configurations(key);
CREATE INDEX IF NOT EXISTS ob_configurations_tenant_id ON ob_configurations(tenant_id);

SELECT diesel_manage_updated_at('ob_configurations');