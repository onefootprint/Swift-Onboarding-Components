CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION random_string( int ) RETURNS TEXT as $$
    SELECT string_agg(substring('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', round(random() * 62)::integer, 1), '') FROM generate_series(1, $1);
$$ language sql;

CREATE FUNCTION prefixed_uid(prefix VARCHAR(8)) 
    returns VARCHAR(250) 
    language plpgsql as $$ 
        begin return CONCAT(prefix, random_string(22));
    end; 
$$; 


CREATE TABLE tenants (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('org_'),
    name text NOT NULL,
    public_key BYTEA NOT NULL,
    e_private_key BYTEA NOT NULL,
    workos_id VARCHAR(250) NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tenants_workos_id ON tenants(workos_id);

CREATE TYPE user_status as ENUM ('Verified', 'Processing', 'Incomplete', 'Failed', 'ManualReview');

CREATE TABLE user_vaults (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('uv_'),  
    e_private_key BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    id_verified user_status NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TYPE data_kind as ENUM ('FirstName', 'LastName', 'Dob', 'Ssn', 'StreetAddress', 'StreetAddress2', 'City', 'State', 'Zip', 'Country', 'Email', 'PhoneNumber');
CREATE TYPE data_priority as ENUM ('Primary', 'Secondary');

CREATE TABLE user_data (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('ud_'),
    user_vault_id VARCHAR(250) NOT NULL,
    data_kind data_kind NOT NULL,
    e_data BYTEA NOT NULL,
    sh_data BYTEA,
    is_verified BOOLEAN NOT NULL,
    data_priority data_priority NOT NULL,
    deactivated_at timestamp,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_valt
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id),
    -- Only allow sh_data to be null for fields other than Ssn, PhoneNumber, Email
    CONSTRAINT check_sh_data CHECK (
        ((sh_data IS NOT NULL) AND (data_kind IN ('Ssn', 'PhoneNumber', 'Email')))
        OR ((sh_data IS NULL) AND (data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email')))
    )
);
-- Don't allow multiple verified UserData rows to exist with the same Ssn, PhoneNumber, or Email fingerprint
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_kind_fingerprint ON user_data(data_kind, sh_data) WHERE is_verified = TRUE AND data_kind IN ('Ssn', 'PhoneNumber', 'Email');
-- Don't allow more than one Primary, active UserData row to exist for each (user, data_kind)
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_primary_data ON user_data(user_vault_id, data_kind) WHERE deactivated_at IS NULL AND data_priority = 'Primary';
CREATE INDEX IF NOT EXISTS user_data_user_vault_id_data_kind ON user_data(user_vault_id, data_kind);

CREATE TABLE onboardings (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('ob_'),
    user_ob_id VARCHAR(250) UNIQUE NOT NULL DEFAULT prefixed_uid('fp_id_'),
    user_vault_id VARCHAR(250) NOT NULL,
    tenant_id VARCHAR(250) NOT NULL,
    status user_status NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id)
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS onboardings_fp_id ON onboardings(user_ob_id);
CREATE INDEX IF NOT EXISTS onboardings_tenant_id ON onboardings(tenant_id);

CREATE TABLE tenant_api_keys (
    tenant_public_key VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('pk_'),
    sh_secret_api_key BYTEA NOT NULL,
    e_secret_api_key BYTEA NOT NULL,
    tenant_id VARCHAR(250) NOT NULL,
    key_name VARCHAR(250) NOT NULL,
    is_enabled BOOLEAN NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
    h_session_id VARCHAR(250) PRIMARY KEY NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    expires_at timestamp NOT NULL,
    session_data jsonb NOT NULL DEFAULT '{}'
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
    
SELECT diesel_manage_updated_at('user_vaults');
SELECT diesel_manage_updated_at('user_data');
SELECT diesel_manage_updated_at('tenants');
SELECT diesel_manage_updated_at('onboardings');
SELECT diesel_manage_updated_at('tenant_api_keys');
SELECT diesel_manage_updated_at('sessions');


