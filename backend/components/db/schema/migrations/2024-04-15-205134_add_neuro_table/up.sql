CREATE TABLE IF NOT EXISTS neuro_id_analytics_event  (
    id text PRIMARY KEY DEFAULT prefixed_uid('nid_'),
    verification_result_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    scoped_vault_id TEXT NOT NULL,
    -- fields for indices/aggregations
    tenant_id TEXT NOT NUll,

    -- signals denorm
    neuro_identifier text NOT NULL,
    -- browser cookie
    cookie_id TEXT,
    -- device ID/fingerprint
    device_id TEXT,

    -- Model results
    model_fraud_ring_indicator_result BOOLEAN,
    model_automated_activity_result BOOLEAN,
    model_risky_device_result BOOLEAN,
    model_factory_reset_result BOOLEAN,
    model_gps_spoofing_result BOOLEAN,
    model_tor_exit_node_result BOOLEAN,
    model_public_proxy_result BOOLEAN,
    model_vpn_result BOOLEAN,
    model_ip_blocklist_result BOOLEAN,
    model_ip_address_association_result BOOLEAN,
    model_incognito_result BOOLEAN,
    model_bot_framework_result BOOLEAN,
    model_suspicious_device_result BOOLEAN,
    model_multiple_ids_per_device_result BOOLEAN,
    model_device_reputation_result BOOLEAN,

    suspicious_device_emulator BOOLEAN,
    suspicious_device_jailbroken BOOLEAN,
    suspicious_device_missing_expected_properties BOOLEAN,
    suspicious_device_frida BOOLEAN,

    -- boilerplate
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_neuro_id_analytics_event_workflow_id
        FOREIGN KEY(workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_neuro_id_analytics_event_scoped_vault_id
        FOREIGN KEY(scoped_vault_id)
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_neuro_id_analytics_event_tenant_id
        FOREIGN KEY(tenant_id)
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_neuro_id_analytics_event_verification_result_id
        FOREIGN KEY(verification_result_id)
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED

);

SELECT diesel_manage_updated_at('neuro_id_analytics_event');
-- device id aggregations
CREATE INDEX IF NOT EXISTS neuro_id_analytics_event_workflow_id ON neuro_id_analytics_event(workflow_id);
-- for dupes
CREATE INDEX IF NOT EXISTS neuro_id_analytics_event_device_id ON neuro_id_analytics_event(device_id);
CREATE INDEX IF NOT EXISTS neuro_id_analytics_event_cookie_id ON neuro_id_analytics_event(cookie_id);
-- aggregations/dupes intra-tenant
CREATE INDEX IF NOT EXISTS neuro_id_analytics_event_tenant_id ON neuro_id_analytics_event(tenant_id);
-- device id aggregations
CREATE INDEX IF NOT EXISTS neuro_id_analytics_event_scoped_vault_id ON neuro_id_analytics_event(scoped_vault_id);