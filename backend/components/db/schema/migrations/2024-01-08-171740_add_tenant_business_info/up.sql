CREATE TABLE tenant_business_info (
    id text PRIMARY KEY DEFAULT prefixed_uid('tbi_'),
	created_at TIMESTAMPTZ NOT NULL,
    created_seqno BIGINT NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    deactivated_seqno BIGINT,
    tenant_id TEXT NOT NULL,
    company_name BYTEA NOT NULL,
	address_line1 BYTEA NOT NULL,
	city BYTEA NOT NULL,
	state BYTEA NOT NULL,
	zip BYTEA NOT NULL,
	phone BYTEA NOT NULL,


    CONSTRAINT fk_tenant_business_info_tenant_id
       FOREIGN KEY(tenant_id) 
       REFERENCES tenant(id)
       DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_business_info_tenant_id ON tenant_business_info(tenant_id);
SELECT diesel_manage_updated_at('tenant_business_info');
CREATE UNIQUE INDEX tenant_business_info_one_active_per_tenant ON tenant_business_info(tenant_id) WHERE deactivated_at IS NULL;
