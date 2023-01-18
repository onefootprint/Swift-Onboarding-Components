
-- Core config
CREATE TABLE proxy_config (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('proxy_id_'),
    tenant_id TEXT NOT NULL,
    is_live bool NOT NULL,
    name TEXT NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    url TEXT NOT NULL,
    method TEXT NOT NULL,

    -- both null or both not-null
    client_identity_cert_der bytea,
    e_client_identity_key_der bytea,

    ingress_content_type TEXT,

    access_reason TEXT,

    CONSTRAINT fk_proxy_config_tenant
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED

);
SELECT diesel_manage_updated_at('proxy_config');
CREATE INDEX IF NOT EXISTS proxy_config_tenant_id_index ON proxy_config(tenant_id);

-- Basic headers like content-type
CREATE TABLE proxy_config_header (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('pc_hdr_'),
    config_id text NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,

    CONSTRAINT fk_proxy_config_header_proxy_config
        FOREIGN KEY(config_id) 
        REFERENCES proxy_config(id)
        DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS proxy_config_header_index ON proxy_config_header(config_id);


-- Secret headers like api keys, etc
CREATE TABLE proxy_config_secret_header (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('pc_sechdr_'),
    config_id text NOT NULL,
    name text NOT NULL,
    e_data bytea NOT NULL,

    CONSTRAINT fk_proxy_config_secret_header_proxy_config
        FOREIGN KEY(config_id) 
        REFERENCES proxy_config(id)
        DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS proxy_config_secret_header_index ON proxy_config_secret_header(config_id);


-- Root CA or server certificate
CREATE TABLE proxy_config_server_cert (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('pc_ca_'),
    config_id text NOT NULL,
    cert_hash bytea NOT NULL, 
    cert_der bytea NOT NULL,

    CONSTRAINT fk_proxy_config_server_cert_proxy_config
        FOREIGN KEY(config_id) 
        REFERENCES proxy_config(id)
        DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS proxy_config_server_cert_index ON proxy_config_server_cert(config_id);

-- Ingress rules
CREATE TABLE proxy_config_ingress_rule (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('pc_ir_'),
    config_id text NOT NULL,
    -- the name of the token
    token_path TEXT NOT NULL,
    -- the target to tokenize, i.e. JSONPath selector
    target TEXT NOT NULL,

    CONSTRAINT fk_proxy_config_ingress_rule_proxy_config
        FOREIGN KEY(config_id) 
        REFERENCES proxy_config(id)
        DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS proxy_config_ingress_index ON proxy_config_ingress_rule(config_id);
