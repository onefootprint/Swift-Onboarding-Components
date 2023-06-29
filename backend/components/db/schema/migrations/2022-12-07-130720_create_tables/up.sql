--
-- tenant
--
CREATE TABLE tenant (
    id text PRIMARY KEY DEFAULT prefixed_uid('org_'),
    name text NOT NULL,
    public_key BYTEA NOT NULL,
    e_private_key BYTEA NOT NULL,
    workos_id VARCHAR(250) UNIQUE,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    logo_url TEXT,
    sandbox_restricted BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS tenant_workos_id ON tenant(workos_id);

SELECT diesel_manage_updated_at('tenant');

--
-- tenant_api_key
--
CREATE TABLE tenant_api_key (
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
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_api_keys_tenant_id ON tenant_api_key(tenant_id);

SELECT diesel_manage_updated_at('tenant_api_key');

--
-- insight_event
--
CREATE TABLE insight_event (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('ie_'),
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
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    is_android_user BOOLEAN,
    is_desktop_viewer BOOLEAN,
    is_ios_viewer BOOLEAN,
    is_mobile_viewer BOOLEAN,
    is_smarttv_viewer BOOLEAN,
    is_tablet_viewer BOOLEAN,
    asn TEXT,
    country_code TEXT,
    forwarded_proto TEXT,
    http_version TEXT,
    tls TEXT
);

SELECT diesel_manage_updated_at('insight_event');

--
-- ob_configuration
--
create table ob_configuration (
    id text primary key default prefixed_uid('ob_config_id_'),
    key text unique not null,
    name varchar(250) not null,
    tenant_id text not null,
    _created_at timestamptz not null default now(),
    _updated_at timestamptz not null default now(),
    is_live BOOLEAN NOT NULL,
    status TEXT NOT NULL,
    created_at timestamptz not null,
    must_collect_data TEXT[] NOT NULL,
    can_access_data TEXT[] NOT NULL,
    must_collect_identity_document BOOLEAN NOT NULL,
    can_access_identity_document_images BOOLEAN NOT NULL,
    CONSTRAINT fk_ob_configurations_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS ob_configurations_key ON ob_configuration(key);
CREATE INDEX IF NOT EXISTS ob_configurations_tenant_id ON ob_configuration(tenant_id);

SELECT diesel_manage_updated_at('ob_configuration');

--
-- user_vault
--
CREATE TABLE user_vault (
    id text PRIMARY KEY DEFAULT prefixed_uid('uv_'),  
    e_private_key BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    is_live BOOLEAN NOT NULL,
    is_portable BOOLEAN NOT NULL
);

SELECT diesel_manage_updated_at('user_vault');

--
-- scoped_user
--
CREATE TABLE scoped_user (
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
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_scoped_users_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS scoped_users_fp_id ON scoped_user(fp_user_id);
CREATE INDEX IF NOT EXISTS scoped_users_tenant_id ON scoped_user(tenant_id);
CREATE INDEX IF NOT EXISTS scoped_users_user_vault_id ON scoped_user(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS scoped_users_unique_user_vault_id_tenant_id ON scoped_user(user_vault_id, tenant_id);
-- Obfuscate the minimum ordering_id
ALTER SEQUENCE scoped_user_ordering_id_seq START 100000;

SELECT diesel_manage_updated_at('scoped_user');


--
-- webauthn_credential
--
CREATE TABLE webauthn_credential (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('wcred_'),
    user_vault_id TEXT NOT NULL,
    
    credential_id BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    attestation_data BYTEA NOT NULL,

    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    backup_eligible boolean not null default False,
    attestation_type text not null DEFAULT 'Unknown',
    insight_event_id TEXT NOT NULL,

    CONSTRAINT fk_webauthn_credentials_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_webauthn_credentials_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_event(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS webauthn_credentials_user_vault_id ON webauthn_credential(user_vault_id);
CREATE INDEX IF NOT EXISTS webauthn_credentials_insight_event_id ON webauthn_credential(insight_event_id);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_pubkey_user_vault_id ON webauthn_credential(public_key);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_id_user_vault_id ON webauthn_credential(credential_id);

SELECT diesel_manage_updated_at('webauthn_credential');

--
-- access_event
--
CREATE TABLE access_event (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('ae_'),
    scoped_user_id text NOT NULL,
    -- TODO who at the tenant accessed?
    -- TODO what was the exact data accessed? if there are multiple emails, might help to store data here
    -- TODO IP address/location?
    timestamp timestamptz NOT NULL DEFAULT NOW(),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    insight_event_id TEXT NOT NULL,
    reason VARCHAR(250),
    principal JSONB NOT NULL,
    ordering_id BIGSERIAL NOT NULL,
    kind TEXT NOT NULL,
    targets TEXT[] NOT NULL,

    CONSTRAINT fk_access_events_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_access_events_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_event(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS access_events_insight_event_id ON access_event(insight_event_id);
CREATE INDEX IF NOT EXISTS access_events_scoped_user_id_targets ON access_event(scoped_user_id, targets);

-- Obfuscate the minimum ordering_id
ALTER SEQUENCE access_event_ordering_id_seq START 100000;

SELECT diesel_manage_updated_at('access_event');

--
-- session
--
CREATE TABLE session (
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
            -- Delete rows in the session table that have been expired for 30 minutes
            DELETE FROM session WHERE expires_at < NOW() - INTERVAL '30 minutes';
            RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_sessions
    AFTER INSERT ON session
    EXECUTE PROCEDURE expire_sessions();
    
SELECT diesel_manage_updated_at('session');

--
-- onboarding
--
CREATE TABLE onboarding (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('ob_'),
    scoped_user_id text NOT NULL,
    ob_configuration_id text NOT NULL,
    start_timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    insight_event_id TEXT NOT NULL,
    is_authorized BOOL NOT NULL,
    idv_reqs_initiated BOOL NOT NULL,
    CONSTRAINT fk_onboardings_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_event(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_onboardings_scoped_user_id
        FOREIGN KEY(scoped_user_id) 
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_onboardings_ob_configuration_id
        FOREIGN KEY(ob_configuration_id) 
        REFERENCES ob_configuration(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT onboarding_unique_scoped_user_id
        UNIQUE (scoped_user_id)
        DEFERRABLE INITIALLY DEFERRED
);
 
CREATE INDEX IF NOT EXISTS onboardings_scoped_user_id ON onboarding(scoped_user_id);
CREATE INDEX IF NOT EXISTS onboardings_ob_configuration_id ON onboarding(ob_configuration_id);
CREATE INDEX IF NOT EXISTS onboardings_insight_event_id ON onboarding(insight_event_id);

--
-- verification_request
--
CREATE TABLE verification_request (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('vreq_'),
    vendor text NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    onboarding_id TEXT NOT NULL,
    vendor_api TEXT NOT NULL,
    uvw_snapshot_seqno BIGINT NOT NULL,
    CONSTRAINT fk_verification_request_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS verification_request_onboarding_id ON verification_request(onboarding_id);

SELECT diesel_manage_updated_at('verification_request');

--
-- verification_result
--
CREATE TABLE verification_result (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('vres_'),
    request_id TEXT NOT NULL,
    response jsonb NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_verification_results_request_id
        FOREIGN KEY(request_id) 
        REFERENCES verification_request(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS verification_results_request_id ON verification_result(request_id);
 
SELECT diesel_manage_updated_at('verification_result');

--
-- tenant_api_key_access_log
--
CREATE TABLE tenant_api_key_access_log (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('klog_'),
    tenant_api_key_id TEXT NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tenant_api_key_access_logs_tenant_api_key_id
        FOREIGN KEY(tenant_api_key_id) 
        REFERENCES tenant_api_key(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_api_key_access_logs_tenant_api_key_id ON tenant_api_key_access_log(tenant_api_key_id, timestamp);

SELECT diesel_manage_updated_at('tenant_api_key_access_log');

-- 
-- data_lifetime
--

-- We could have postgres automagically create this sequence with BIGSERIAL for us, but since it's
-- used in multiple columns, it's useful to keep separate
CREATE SEQUENCE data_lifetime_seqno AS BIGINT;

CREATE TABLE data_lifetime (
    id text PRIMARY KEY DEFAULT prefixed_uid('dl_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_vault_id TEXT NOT NULL,
    scoped_user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    committed_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    created_seqno BIGINT NOT NULL,
    committed_seqno BIGINT,
    deactivated_seqno BIGINT,
    CONSTRAINT fk_data_lifetime_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_data_lifetime_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS data_lifetime_user_vault_id ON data_lifetime(user_vault_id);
CREATE INDEX IF NOT EXISTS data_lifetime_scoped_user_id ON data_lifetime(scoped_user_id);

SELECT diesel_manage_updated_at('data_lifetime');

--
-- user_vault_data
--

CREATE TABLE user_vault_data (
    id text PRIMARY KEY DEFAULT prefixed_uid('uvd_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lifetime_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    e_data BYTEA NOT NULL, 
    CONSTRAINT fk_user_vault_data_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS user_vault_data_lifetime_id ON user_vault_data(lifetime_id);

SELECT diesel_manage_updated_at('user_vault_data');

--
-- fingerprint
--
CREATE TABLE fingerprint (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('fprint_'),
    sh_data BYTEA NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    kind TEXT NOT NULL,
    lifetime_id TEXT NOT NULL,
    CONSTRAINT fk_fingerprint_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

-- TODO in the future: might want to denormalize the concept of deactivation onto fingerprints to make these queries faster with a partial index
CREATE INDEX IF NOT EXISTS fingerprint_sh_data ON fingerprint(sh_data);
CREATE INDEX IF NOT EXISTS fingerprint_lifetime_id ON fingerprint(lifetime_id);

--
-- phone_number
--
CREATE TABLE phone_number (
    id text PRIMARY KEY DEFAULT prefixed_uid('ph_'),
    e_e164 BYTEA NOT NULL,
    e_country BYTEA NOT NULL,
    is_verified BOOLEAN NOT NULL,
    priority TEXT NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    lifetime_id TEXT NOT NULL,
    CONSTRAINT fk_phone_number_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

-- TODO unique index for one primary 
CREATE INDEX IF NOT EXISTS phone_number_lifetime_id ON phone_number(lifetime_id);

--
-- email
--
CREATE TABLE email (
    id text PRIMARY KEY DEFAULT prefixed_uid('em_'),
    e_data BYTEA NOT NULL,
    is_verified BOOLEAN NOT NULL,
    priority TEXT NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    lifetime_id TEXT NOT NULL,
    CONSTRAINT fk_email_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

-- TODO unique index for one primary 
CREATE INDEX IF NOT EXISTS email_lifetime_id ON email(lifetime_id);

--
-- kv_data
--

CREATE TABLE kv_data (
    id text PRIMARY KEY DEFAULT prefixed_uid('data_'),
    user_vault_id text NOT NULL,
    tenant_id text NOT NULL,
    data_key text NOT NULL,
    e_data BYTEA NOT NULL,    
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_kv_data_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_kv_data_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS kv_data_user_vault ON kv_data(user_vault_id);
CREATE INDEX IF NOT EXISTS kv_data_tenant ON kv_data(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS kv_data_key ON kv_data(data_key, user_vault_id, tenant_id) WHERE deactivated_at IS NULL;

--
-- tennat_role
--

CREATE TABLE tenant_role (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('orgrole_'),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    permissions JSONB NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at timestamptz NOT NULL,
    deactivated_at TIMESTAMPTZ,
    CONSTRAINT fk_tenant_role_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_role_tenant_id ON tenant_role(tenant_id);
CREATE UNIQUE INDEX tenant_role_unique_name_for_tenant_id ON tenant_role(tenant_id, LOWER(name));

SELECT diesel_manage_updated_at('tenant_role');

--
-- tenant_user
--

CREATE TABLE tenant_user (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('orguser_'),
    tenant_role_id TEXT NOT NULL,
    email TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at timestamptz NOT NULL,
    last_login_at timestamptz,
    tenant_id TEXT NOT NULL,
    deactivated_at TIMESTAMPTZ,
    first_name TEXT,
    last_name TEXT,
    CONSTRAINT fk_tenant_user_tenant_role_id
        FOREIGN KEY(tenant_role_id) 
        REFERENCES tenant_role(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_tenant_user_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_user_tenant_role_id ON tenant_user(tenant_role_id);
CREATE INDEX IF NOT EXISTS tenant_user_tenant_id ON tenant_user(tenant_id);
CREATE UNIQUE INDEX tenant_user_unique_tenant_email ON tenant_user(email, tenant_id) WHERE deactivated_at IS NULL;

SELECT diesel_manage_updated_at('tenant_user');

--
-- document_request
--
CREATE TABLE document_request (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('dr_'),
    scoped_user_id TEXT NOT NULL,
    ref_id TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_document_request_scoped_user_id
        FOREIGN KEY(scoped_user_id) 
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS document_request_scoped_user_id ON document_request(scoped_user_id);

SELECT diesel_manage_updated_at('document_request');

--
-- identity_document
--

CREATE TABLE identity_document (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('iddoc_'),
    request_id TEXT NOT NULL,
    user_vault_id TEXT NOT NULL,
    front_image_s3_url TEXT,
    back_image_s3_url TEXT,
    document_type TEXT NOT NULL,
    country_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scoped_user_id TEXT,
    e_data_key BYTEA NOT NULL,
    CONSTRAINT fk_identity_document_request_id
        FOREIGN KEY(request_id) 
        REFERENCES document_request(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_identity_document_scoped_user_id
        FOREIGN KEY(scoped_user_id) 
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS identity_document_request_id ON identity_document(request_id);
CREATE INDEX IF NOT EXISTS identity_document_scoped_user_id ON identity_document(scoped_user_id);

SELECT diesel_manage_updated_at('identity_document');

--
-- onboarding_decision
--

CREATE TABLE onboarding_decision (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('decision_'),
    onboarding_id TEXT NOT NULL,
    logic_git_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    status TEXT NOT NULL,
    actor JSONB NOT NULL,
    seqno BIGINT,
    CONSTRAINT fk_onboarding_decision_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS onboarding_decision_onboarding_id_index ON onboarding_decision(onboarding_id);
SELECT diesel_manage_updated_at('onboarding_decision');


--
-- onboarding_decision_verification_result_junction
-- Junction table to link verification results to a decision
--

CREATE TABLE onboarding_decision_verification_result_junction(
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('od_vres_'),
    verification_result_id TEXT NOT NULL,
    onboarding_decision_id TEXT NOT NULL,

    CONSTRAINT fk_onboarding_decision_verification_result_junction_verification_result_id
        FOREIGN KEY(verification_result_id) 
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_onboarding_decision_verification_result_junction_onboarding_decision_id
        FOREIGN KEY(onboarding_decision_id) 
        REFERENCES onboarding_decision(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS junction_verification_result_id_index ON onboarding_decision_verification_result_junction(verification_result_id);
CREATE INDEX IF NOT EXISTS junction_onboarding_decision_id_index ON onboarding_decision_verification_result_junction(onboarding_decision_id);

--
-- risk_signal
--

CREATE TABLE risk_signal (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('sig_'),
    onboarding_decision_id TEXT NOT NULL,
    reason_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    deactivated_at TIMESTAMPTZ,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vendors TEXT[] NOT NULL,
    
    CONSTRAINT fk_risk_signal_onboarding_decision_id
        FOREIGN KEY(onboarding_decision_id) 
        REFERENCES onboarding_decision(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS risk_signal_onboarding_decision_id_index ON risk_signal(onboarding_decision_id);

SELECT diesel_manage_updated_at('risk_signal');


--
-- user_timeline
--

CREATE TABLE user_timeline (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('ut_'),
    scoped_user_id TEXT,
    event jsonb NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    user_vault_id TEXT NOT NULL,
    CONSTRAINT fk_user_timeline_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_user_timeline_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS user_timeline_scoped_user_id ON user_timeline(scoped_user_id);
CREATE INDEX IF NOT EXISTS user_timeline_user_vault_id ON user_timeline(user_vault_id);

SELECT diesel_manage_updated_at('user_timeline');

--
-- liveness_event
--

CREATE TABLE liveness_event (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('liveness_'),
    scoped_user_id TEXT NOT NULL,
    liveness_source TEXT NOT NULL,
    attributes jsonb,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    insight_event_id TEXT NOT NULL,

    CONSTRAINT fk_liveness_onboarding_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_liveness_event_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_event(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS user_liveness_event_scoped_user_id ON liveness_event(scoped_user_id);
CREATE INDEX IF NOT EXISTS user_liveness_event_insight_event_id ON liveness_event(insight_event_id);

SELECT diesel_manage_updated_at('liveness_event');

--
-- annotation
--

CREATE TABLE annotation (
    id text PRIMARY KEY DEFAULT prefixed_uid('annotation_'),
    timestamp TIMESTAMPTZ NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    scoped_user_id TEXT NOT NULL,
    note TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL,
    actor JSONB NOT NULL,
    CONSTRAINT fk_annotation_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS annotation_scoped_user_id ON annotation(scoped_user_id);

SELECT diesel_manage_updated_at('annotation');

--
-- manual_review
--

CREATE TABLE manual_review (
    id text PRIMARY KEY DEFAULT prefixed_uid('mr_'),
    timestamp TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    onboarding_id TEXT NOT NULL,
    completed_at TIMESTAMPTZ,
    completed_by_decision_id TEXT,
    completed_by_actor JSONB,
    CONSTRAINT fk_manual_review_onboarding_id
        FOREIGN KEY(onboarding_id)
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_manual_review_completed_by_decision_id
        FOREIGN KEY(completed_by_decision_id)
        REFERENCES onboarding_decision(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS manual_review_onboarding_id ON manual_review(onboarding_id);
CREATE INDEX IF NOT EXISTS manual_review_completed_by_decision_id ON manual_review(completed_by_decision_id);

CREATE UNIQUE INDEX IF NOT EXISTS manual_review_unique_onboarding_id ON manual_review(onboarding_id) WHERE completed_at IS NULL;

SELECT diesel_manage_updated_at('manual_review');