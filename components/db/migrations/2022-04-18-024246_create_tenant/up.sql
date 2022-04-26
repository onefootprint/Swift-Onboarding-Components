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
    name text NOT NULL
);

CREATE TYPE User_Status as ENUM ('Verified', 'Processing', 'Incomplete', 'Failed');

CREATE TABLE users (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('uid_'),  
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
    is_email_verified BOOLEAN,
    sh_email BYTEA,
    e_phone_number BYTEA,
    is_phone_number_verified BOOLEAN,
    sh_phone_number BYTEA,
    id_verified User_Status NOT NULL
);

CREATE INDEX IF NOT EXISTS users_sh_ssn ON users(sh_ssn);
CREATE INDEX IF NOT EXISTS users_sh_phone_number ON users(sh_phone_number);
CREATE INDEX IF NOT EXISTS users_sh_email ON users(sh_email);

CREATE TABLE user_tenant_verifications (
    tenant_user_id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('org_scoped_uid_'),
    tenant_id VARCHAR(250) NOT NULL,
    user_id VARCHAR(250) NOT NULL,
    status User_Status NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id)
        REFERENCES tenants(id)
);

CREATE TABLE tenant_api_keys (
    api_key_id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('pub_key_'),
    tenant_id VARCHAR(250) NOT NULL,
    name VARCHAR(250) NOT NULL,
    sh_api_key BYTEA NOT NULL,
    is_enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE temp_tenant_user_tokens (
    h_token VARCHAR(250) PRIMARY KEY NOT NULL,
    timestamp timestamp NOT NULL DEFAULT NOW(),
    user_id VARCHAR(250) NOT NULL,
    tenant_id VARCHAR(250) NOT NULL,
    tenant_user_id VARCHAR(250) NOT NULL, 
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id)
        REFERENCES tenants(id),
    CONSTRAINT fk_tenant_user_id
        FOREIGN KEY(tenant_user_id)
        REFERENCES user_tenant_verifications(tenant_user_id)
);

CREATE FUNCTION token_expiry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            DELETE FROM temp_tenant_user_tokens WHERE timestamp < NOW() - INTERVAL '4 hours';
             RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_temp_tenant_user_token
    AFTER INSERT ON temp_tenant_user_tokens
    EXECUTE PROCEDURE token_expiry();