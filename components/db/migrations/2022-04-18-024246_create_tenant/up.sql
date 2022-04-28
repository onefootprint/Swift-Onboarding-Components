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
    e_private_key BYTEA NOT NULL
);

CREATE TYPE User_Status as ENUM ('Verified', 'Processing', 'Incomplete', 'Failed');

CREATE TABLE user_vaults (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('uv_'),  
    e_private_key BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    e_first_name BYTEA,
    e_last_name BYTEA,
    -- TODO: should we store dob as day, month, year separately?
    e_dob BYTEA,
    e_ssn BYTEA,
    sh_ssn BYTEA,
    e_street_address BYTEA,
    e_city BYTEA,
    e_state BYTEA,
    e_email BYTEA,
    is_email_verified BOOLEAN NOT NULL,
    sh_email BYTEA,
    e_phone_number BYTEA,
    is_phone_number_verified BOOLEAN NOT NULL,
    sh_phone_number BYTEA,
    id_verified User_Status NOT NULL
);

CREATE INDEX IF NOT EXISTS user_vaults_sh_ssn ON user_vaults(sh_ssn);
CREATE INDEX IF NOT EXISTS user_vaults_sh_phone_number ON user_vaults(sh_phone_number);
CREATE INDEX IF NOT EXISTS user_vaults_sh_email ON user_vaults(sh_email);

CREATE TABLE onboardings (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('ob_'),
    tenant_id VARCHAR(250) NOT NULL,
    user_vault_id VARCHAR(250) NOT NULL,
    footprint_user_id VARCHAR(250) UNIQUE NOT NULL DEFAULT prefixed_uid('fp_id_'),
    status User_Status NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id)
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS onboardings_fp_id ON onboardings(footprint_user_id);
CREATE INDEX IF NOT EXISTS onboardings_tenant_id ON onboardings(tenant_id);

CREATE TABLE tenant_api_keys (
    api_key_id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('pk_'),
    tenant_id VARCHAR(250) NOT NULL,
    name VARCHAR(250) NOT NULL,
    sh_api_key BYTEA NOT NULL,
    e_api_key BYTEA NOT NULL,
    is_enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE onboarding_session_tokens (
    h_token VARCHAR(250) PRIMARY KEY NOT NULL,
    timestamp timestamp NOT NULL DEFAULT NOW(),
    user_vault_id VARCHAR(250) NOT NULL,
    tenant_id VARCHAR(250) NOT NULL,
    footprint_user_id VARCHAR(250) NOT NULL, 
    CONSTRAINT fk_user
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id)
        REFERENCES tenants(id),
    CONSTRAINT fk_tenant_user_id
        FOREIGN KEY(footprint_user_id)
        REFERENCES onboardings(footprint_user_id)
);

CREATE FUNCTION token_expiry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            DELETE FROM onboarding_session_tokens WHERE timestamp < NOW() - INTERVAL '4 hours';
             RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_onboarding_token
    AFTER INSERT ON onboarding_session_tokens
    EXECUTE PROCEDURE token_expiry();