CREATE TABLE tenant_tag (
  id TEXT PRIMARY KEY DEFAULT prefixed_uid('tt_'),
  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  tenant_id text NOT NULL,
  created_by_actor jsonb NOT NULL,
  kind TEXT NOT NULL,
  tag TEXT NOT NULL,
  is_live BOOLEAN NOT NULL,

  deactivated_at timestamptz,
  deactivated_by_actor jsonb,

  CONSTRAINT fk_tenant_tag_tenant_id
      FOREIGN KEY(tenant_id)
      REFERENCES tenant(id)
      DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_tag_tenant_id ON tenant_tag(tenant_id);

SELECT diesel_manage_updated_at('tenant_tag');
