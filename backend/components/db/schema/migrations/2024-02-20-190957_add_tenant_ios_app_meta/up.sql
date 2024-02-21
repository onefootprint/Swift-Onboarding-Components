CREATE TABLE tenant_ios_app_meta (
  id TEXT PRIMARY KEY DEFAULT prefixed_uid('taam_'),
  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  tenant_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  app_bundle_ids TEXT[] NOT NULL,
  device_check_key_id TEXT NOT NULL,
  e_device_check_private_key BYTEA NOT NULL,

  deactivated_at timestamptz,

  CONSTRAINT fk_tenant_ios_app_meta_tenant_id
      FOREIGN KEY(tenant_id)
      REFERENCES tenant(id)
      DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_ios_app_meta_tenant_id ON tenant_ios_app_meta(tenant_id);

SELECT diesel_manage_updated_at('tenant_ios_app_meta');