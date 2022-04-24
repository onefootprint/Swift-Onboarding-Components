CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenant (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL
);

CREATE TYPE User_Status as ENUM ('Verified', 'Processing', 'Incomplete', 'Failed');

CREATE TABLE fp_user (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),  
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

CREATE INDEX IF NOT EXISTS fp_user_sh_ssn ON fp_user(sh_ssn);
CREATE INDEX IF NOT EXISTS fp_user_sh_phone_number ON fp_user(sh_phone_number);
CREATE INDEX IF NOT EXISTS fp_user_sh_email ON fp_user(sh_email);

CREATE TABLE user_tenant_verification (
    verification_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status User_Status NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES fp_user(id),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id)
        REFERENCES tenant(id)
);

CREATE TABLE tenant_publishable_api_key (
    tenant_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(250) NOT NULL,
    api_key VARCHAR(250) NOT NULL,
    api_key_hash BYTEA,
    is_enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE temp_tenant_user_token (
    token_hash VARCHAR(250) PRIMARY KEY NOT NULL,
    timestamp timestamp NOT NULL DEFAULT NOW(),
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES fp_user(id),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id)
        REFERENCES tenant(id)
);

CREATE FUNCTION token_expiry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            DELETE FROM temp_tenant_user_token WHERE timestamp < NOW() - INTERVAL '4 hours';
             RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_temp_tenant_user_token
    AFTER INSERT ON temp_tenant_user_token
    EXECUTE PROCEDURE token_expiry();