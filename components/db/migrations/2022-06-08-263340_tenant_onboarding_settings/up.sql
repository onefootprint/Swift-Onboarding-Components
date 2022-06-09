create table ob_configurations (
    id varchar(250) primary key default prefixed_uid('org_config_'),
    name varchar(250) not null,
    description varchar(250),
    tenant_id varchar(250) not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    required_user_data data_kind[] not null default ARRAY[
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
    ]::data_kind[],
    /* abstract configuration data for flexibility? */
    settings jsonb not null default '{}',
    CONSTRAINT fk_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(id)
);

SELECT diesel_manage_updated_at('ob_configurations');
