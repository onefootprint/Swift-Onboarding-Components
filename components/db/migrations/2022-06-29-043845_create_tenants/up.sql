CREATE TABLE tenants (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('org_'),
    name text NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    e_private_key BYTEA NOT NULL,
    workos_id VARCHAR(250) NOT NULL UNIQUE,
    email_domain VARCHAR(250) NOT NULL UNIQUE,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tenants_workos_id ON tenants(workos_id);

SELECT diesel_manage_updated_at('tenants');