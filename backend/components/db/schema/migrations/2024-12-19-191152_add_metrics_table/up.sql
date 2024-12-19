CREATE TABLE tenant_metrics (
    id text PRIMARY KEY DEFAULT prefixed_uid('tm_'),
    tenant_id text NOT NULL,
    data JSONB NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tenant_metrics_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);


CREATE UNIQUE INDEX IF NOT EXISTS tenant_metrics_tenant_id ON tenant_metrics(tenant_id);

SELECT diesel_manage_updated_at('tenant_metrics');
