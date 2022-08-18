--
-- tenants
--
CREATE TABLE tenants (
    id text PRIMARY KEY DEFAULT prefixed_uid('org_'),
    name text NOT NULL,
    public_key BYTEA NOT NULL,
    e_private_key BYTEA NOT NULL,
    workos_id VARCHAR(250) UNIQUE,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    logo_url TEXT,
    workos_admin_profile_id TEXT,
    sandbox_restricted BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS tenants_workos_id ON tenants(workos_id);
CREATE UNIQUE INDEX IF NOT EXISTS tenants_profile_id ON tenants(workos_admin_profile_id);

SELECT diesel_manage_updated_at('tenants');

--
-- tenant_api_keys
--
CREATE TABLE tenant_api_keys (
    id text PRIMARY KEY DEFAULT prefixed_uid('key_id_'),
    sh_secret_api_key BYTEA NOT NULL,
    e_secret_api_key BYTEA NOT NULL,
    tenant_id text NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    is_live BOOLEAN NOT NULL,
    status TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_tenant_api_keys_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS tenant_api_keys_tenant_id ON tenant_api_keys(tenant_id);

SELECT diesel_manage_updated_at('tenant_api_keys');

--
-- insight_events
--
CREATE TABLE insight_events (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),    
    timestamp timestamptz NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(250),
    country VARCHAR(250),
    region VARCHAR(250),
    region_name VARCHAR(250),
    latitude double precision,
    longitude double precision,
    metro_code VARCHAR(250),
    postal_code VARCHAR(250),
    time_zone VARCHAR(250),
    user_agent VARCHAR(250),
    city VARCHAR(250),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW()
);

SELECT diesel_manage_updated_at('insight_events');

--
-- ob_configurations
--
create table ob_configurations (
    id text primary key default prefixed_uid('ob_config_id_'),
    key text unique not null,
    name varchar(250) not null,
    tenant_id text not null,
    _created_at timestamptz not null default now(),
    _updated_at timestamptz not null default now(),
    must_collect_data_kinds text[] not null,
    can_access_data_kinds text[] not null,
    is_live BOOLEAN NOT NULL,
    status TEXT NOT NULL,
    created_at timestamptz not null,
    CONSTRAINT fk_ob_configurations_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS ob_configurations_key ON ob_configurations(key);
CREATE INDEX IF NOT EXISTS ob_configurations_tenant_id ON ob_configurations(tenant_id);

SELECT diesel_manage_updated_at('ob_configurations');

--
-- user_vaults
--
CREATE TABLE user_vaults (
    id text PRIMARY KEY DEFAULT prefixed_uid('uv_'),  
    e_private_key BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    is_live BOOLEAN NOT NULL,
    is_portable BOOLEAN NOT NULL
);

SELECT diesel_manage_updated_at('user_vaults');

--
-- scoped_users
--
CREATE TABLE scoped_users (
    id text PRIMARY KEY DEFAULT prefixed_uid('su_'),
    fp_user_id text UNIQUE NOT NULL DEFAULT prefixed_uid('fp_id_'),
    user_vault_id text NOT NULL,
    tenant_id text NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    ordering_id BIGSERIAL NOT NULL,
    start_timestamp timestamptz NOT NULL,
    is_live BOOLEAN NOT NULL,
    CONSTRAINT fk_scoped_users_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(id),
    CONSTRAINT fk_scoped_users_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS scoped_users_fp_id ON scoped_users(fp_user_id);
CREATE INDEX IF NOT EXISTS scoped_users_tenant_id ON scoped_users(tenant_id);
CREATE INDEX IF NOT EXISTS scoped_users_user_vault_id ON scoped_users(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS scoped_users_unique_user_vault_id_tenant_id ON scoped_users(user_vault_id, tenant_id);

SELECT diesel_manage_updated_at('scoped_users');


--
-- webauthn_credentials
--
CREATE TABLE webauthn_credentials (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id text NOT NULL,
    
    credential_id BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    attestation_data BYTEA NOT NULL,

    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    backup_eligible boolean not null default False,
    attestation_type text not null DEFAULT 'Unknown',
    insight_event_id uuid NOT NULL,

    CONSTRAINT fk_webauthn_credentials_user_vault_id
      FOREIGN KEY(user_vault_id)
      REFERENCES user_vaults(id),
    CONSTRAINT fk_webauthn_credentials_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id)
);

CREATE INDEX IF NOT EXISTS webauthn_credentials_user_vault_id ON webauthn_credentials(user_vault_id);
CREATE INDEX IF NOT EXISTS webauthn_credentials_insight_event_id ON webauthn_credentials(insight_event_id);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_pubkey_user_vault_id ON webauthn_credentials(public_key);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_id_user_vault_id ON webauthn_credentials(credential_id);

SELECT diesel_manage_updated_at('webauthn_credentials');


--
-- access_events
--
CREATE TABLE access_events (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    scoped_user_id text NOT NULL,
    -- TODO who at the tenant accessed?
    -- TODO what was the exact data accessed? if there are multiple emails, might help to store data here
    -- TODO IP address/location?
    timestamp timestamptz NOT NULL DEFAULT NOW(),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    insight_event_id uuid NOT NULL,
    reason VARCHAR(250) NOT NULL,
    principal VARCHAR(250),
    data_kinds text[] NOT NULL,
    ordering_id BIGSERIAL NOT NULL,

    CONSTRAINT fk_access_events_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_users(id),
    CONSTRAINT fk_access_events_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id)
);

CREATE INDEX IF NOT EXISTS access_events_scoped_user_id_data_kind ON access_events(scoped_user_id, data_kinds);
CREATE INDEX IF NOT EXISTS access_events_insight_event_id ON access_events(insight_event_id);

SELECT diesel_manage_updated_at('access_events');

--
-- sessions
--
CREATE TABLE sessions (
    key VARCHAR(250) PRIMARY KEY NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    expires_at timestamptz NOT NULL,
    data BYTEA NOT NULL
);

CREATE FUNCTION expire_sessions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            -- Delete rows in the sessions table that have been expired for 30 minutes
            DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '30 minutes';
            RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_sessions
    AFTER INSERT ON sessions
    EXECUTE PROCEDURE expire_sessions();
    
SELECT diesel_manage_updated_at('sessions');


--
-- verification_requests
--
CREATE TABLE verification_requests (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    scoped_user_id text NOT NULL,
    vendor text NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_verification_requests_scoped_user_id
        FOREIGN KEY(scoped_user_id) 
        REFERENCES scoped_users(id)
);

CREATE INDEX IF NOT EXISTS verification_requests_scoped_user_id ON verification_requests(scoped_user_id);

SELECT diesel_manage_updated_at('verification_requests');

-- Junction table to attach multiple user_data rows to one verification_request
CREATE TABLE verification_requests_user_data (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_data_id text NOT NULL,
    request_id uuid NOT NULL,
    CONSTRAINT fk_verification_requests_user_data_request_id
        FOREIGN KEY(request_id) 
        REFERENCES verification_requests(id)
);
 
CREATE INDEX IF NOT EXISTS fk_verification_requests_user_data_request_id ON verification_requests_user_data(request_id);

--
-- verification_results
--
CREATE TABLE verification_results (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id uuid NOT NULL,
    response jsonb NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_verification_results_request_id
        FOREIGN KEY(request_id) 
        REFERENCES verification_requests(id)
);

CREATE INDEX IF NOT EXISTS verification_results_request_id ON verification_results(request_id);
 
SELECT diesel_manage_updated_at('verification_results');

--
-- audit_trails
--
CREATE TABLE audit_trails (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id text NOT NULL,
    tenant_id text,
    event jsonb NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_audit_trails_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vaults(id),
    CONSTRAINT fk_audit_trails_tenant_id
        FOREIGN KEY(tenant_id)
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS audit_trails_user_vault_id ON audit_trails(user_vault_id);
CREATE INDEX IF NOT EXISTS audit_trails_tenant_id ON audit_trails(tenant_id);

SELECT diesel_manage_updated_at('audit_trails');


--
-- onboardings
--
CREATE TABLE onboardings (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    scoped_user_id text NOT NULL,
    ob_configuration_id text NOT NULL,
    start_timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL,
    insight_event_id UUID NOT NULL,
    CONSTRAINT fk_onboardings_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id),
    CONSTRAINT fk_onboardings_scoped_user_id
        FOREIGN KEY(scoped_user_id) 
        REFERENCES scoped_users(id),
    CONSTRAINT fk_onboardings_ob_configuration_id
        FOREIGN KEY(ob_configuration_id) 
        REFERENCES ob_configurations(id)
);
 
CREATE INDEX IF NOT EXISTS onboardings_scoped_user_id ON onboardings(scoped_user_id);
CREATE INDEX IF NOT EXISTS onboardings_ob_configuration_id ON onboardings(ob_configuration_id);
CREATE INDEX IF NOT EXISTS onboardings_insight_event_id ON onboardings(insight_event_id);
CREATE UNIQUE INDEX IF NOT EXISTS onboardings_scoped_user_id_ob_configuration_id ON onboardings(scoped_user_id, ob_configuration_id);


--
-- tenant_api_key_access_logs
--
CREATE TABLE tenant_api_key_access_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_api_key_id TEXT NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tenant_api_key_access_logs_tenant_api_key_id
        FOREIGN KEY(tenant_api_key_id) 
        REFERENCES tenant_api_keys(id)
);

CREATE INDEX IF NOT EXISTS tenant_api_key_access_logs_tenant_api_key_id ON tenant_api_key_access_logs(tenant_api_key_id, timestamp);

SELECT diesel_manage_updated_at('tenant_api_key_access_logs');

--
-- fingerprint
--
CREATE TABLE fingerprint (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id text NOT NULL,
    sh_data BYTEA NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    data_kind TEXT NOT NULL,
    is_unique BOOLEAN NOT NULL,
    CONSTRAINT fk_fingerprint_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS fingerprint_user_vault_id ON fingerprint(user_vault_id);
CREATE INDEX IF NOT EXISTS fingerprint_sh_data ON fingerprint(sh_data) WHERE deactivated_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS fingerprint_sh_data_unique ON fingerprint(sh_data, data_kind) WHERE deactivated_at IS NULL AND is_unique = True;

--
-- phone_number
--
CREATE TABLE phone_number (
    id text PRIMARY KEY DEFAULT prefixed_uid('ph_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,
    e_e164 BYTEA NOT NULL,
    e_country BYTEA NOT NULL,
    is_verified BOOLEAN NOT NULL,
    priority TEXT NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_phone_number_user_valt_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS phone_number_user_vault_id ON phone_number(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS phone_number_unique_primary ON phone_number(user_vault_id) WHERE deactivated_at IS NULL AND priority = 'Primary';

--
-- email
--
CREATE TABLE email (
    id text PRIMARY KEY DEFAULT prefixed_uid('em_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,
    e_data BYTEA NOT NULL,
    is_verified BOOLEAN NOT NULL,
    priority TEXT NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_email_user_valt_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS email_user_vault_id ON email(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS email_unique_primary ON email(user_vault_id) WHERE deactivated_at IS NULL AND priority = 'Primary';

--
-- identity_data
--
CREATE TABLE identity_data (
    id text PRIMARY KEY DEFAULT prefixed_uid('identity_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,

    e_first_name BYTEA,
    e_last_name BYTEA,
    e_dob BYTEA,
    e_ssn9 BYTEA,
    e_ssn4 BYTEA,

    e_address_line1 BYTEA,
    e_address_line2 BYTEA,
    e_address_city BYTEA,
    e_address_state BYTEA,
    e_address_zip BYTEA,
    e_address_country BYTEA,

    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_id_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS id_data_user_vault_id ON identity_data(user_vault_id);