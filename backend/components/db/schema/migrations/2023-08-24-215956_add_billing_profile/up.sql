CREATE TABLE billing_profile (
    id text PRIMARY KEY DEFAULT prefixed_uid('bp_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    tenant_id TEXT NOT NULL,

    kyc TEXT,
    kyb TEXT,
    pii TEXT,
    id_docs TEXT,
    watchlist TEXT,

    hot_vaults TEXT,
    hot_proxy_vaults TEXT,

    CONSTRAINT fk_billing_profile_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX billing_profile_tenant_id ON billing_profile(tenant_id);

SELECT diesel_manage_updated_at('billing_profile');