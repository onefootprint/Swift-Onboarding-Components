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
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
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
    sh_ssn BYTEA UNIQUE,
    e_street_address BYTEA,
    e_city BYTEA,
    e_state BYTEA,
    e_email BYTEA,
    is_email_verified BOOLEAN NOT NULL,
    sh_email BYTEA UNIQUE,
    e_phone_number BYTEA,
    is_phone_number_verified BOOLEAN NOT NULL,
    sh_phone_number BYTEA UNIQUE,
    id_verified User_Status NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_vaults_sh_ssn ON user_vaults(sh_ssn);
CREATE INDEX IF NOT EXISTS user_vaults_sh_phone_number ON user_vaults(sh_phone_number);
CREATE INDEX IF NOT EXISTS user_vaults_sh_email ON user_vaults(sh_email);

CREATE TABLE onboardings (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('ob_'),
    user_ob_id VARCHAR(250) UNIQUE NOT NULL DEFAULT prefixed_uid('fp_id_'),
    user_vault_id VARCHAR(250) NOT NULL,
    tenant_id VARCHAR(250) NOT NULL,
    status User_Status NOT NULL,
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

CREATE TABLE onboarding_session_tokens (
    h_token VARCHAR(250) PRIMARY KEY NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    user_ob_id VARCHAR(250) NOT NULL, 
    CONSTRAINT fk_user_ob_id
        FOREIGN KEY(user_ob_id)
        REFERENCES onboardings(user_ob_id)
);

CREATE FUNCTION token_expiry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            DELETE FROM onboarding_session_tokens WHERE created_at < NOW() - INTERVAL '4 hours';
             RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_onboarding_token
    AFTER INSERT ON onboarding_session_tokens
    EXECUTE PROCEDURE token_expiry();

CREATE OR REPLACE FUNCTION refresh_updated_at()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER refresh_updated_at_uv BEFORE UPDATE ON user_vaults FOR EACH ROW EXECUTE PROCEDURE  refresh_updated_at();
CREATE TRIGGER refresh_updated_at_tenant BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE  refresh_updated_at();
CREATE TRIGGER refresh_updated_at_api_keys BEFORE UPDATE ON tenant_api_keys FOR EACH ROW EXECUTE PROCEDURE  refresh_updated_at();
CREATE TRIGGER refresh_updated_at_ob BEFORE UPDATE ON onboardings FOR EACH ROW EXECUTE PROCEDURE refresh_updated_at();