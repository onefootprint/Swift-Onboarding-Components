CREATE TABLE list (
    id text PRIMARY KEY DEFAULT prefixed_uid('lst_'),
	created_at TIMESTAMPTZ NOT NULL,
    created_seqno BIGINT NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    deactivated_seqno BIGINT,

    tenant_id TEXT NOT NULL,
    is_live BOOLEAN NOT NULL,
    actor JSONB NOT NULL,
    name TEXT NOT NULL,
    alias TEXT NOT NULL,
    kind TEXT NOT NULL,
    e_data_key BYTEA NOT NULL,

    CONSTRAINT fk_list_tenant_id
       FOREIGN KEY(tenant_id) 
       REFERENCES tenant(id)
       DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS list_tenant_id ON list(tenant_id);
SELECT diesel_manage_updated_at('list');
