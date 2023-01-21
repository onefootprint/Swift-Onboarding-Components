CREATE TABLE proxy_request_log (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('proxy_req_'),

    tenant_id TEXT NOT NULL,
    
    -- configurations are optional
    config_id TEXT,

    e_url bytea NOT NULL,
    method TEXT NOT NULL,

    sent_at timestamptz NOT NULL,
    received_at timestamptz,
    
    status_code INTEGER,
    e_request_data bytea NOT NULL,
    e_response_data bytea,
    request_error TEXT,

    CONSTRAINT fk_proxy_request_log_tenant
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_proxy_request_log_proxy_config
        FOREIGN KEY(config_id) 
        REFERENCES proxy_config(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS proxy_tenant_request_log_id_index ON proxy_request_log(tenant_id);
CREATE INDEX IF NOT EXISTS proxy_config_request_log_id_index ON proxy_request_log(config_id);

-- logs contain sensitive data so we expire after 30 days
CREATE FUNCTION expire_proxy_request_logs() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            DELETE FROM proxy_request_log WHERE sent_at < NOW() - INTERVAL '30 days';
            RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_proxy_request_logs_rows
    AFTER INSERT ON proxy_request_log
    EXECUTE PROCEDURE expire_proxy_request_logs();
