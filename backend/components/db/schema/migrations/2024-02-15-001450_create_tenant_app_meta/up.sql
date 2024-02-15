CREATE TABLE tenant_app_meta (
  id TEXT PRIMARY KEY DEFAULT prefixed_uid('tam_'),
  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  tenant_id text NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  ios_app_bundle_id TEXT,
  ios_team_id TEXT,
  android_package_name TEXT,
  android_apk_cert_sha256 TEXT,

  deactivated_at timestamptz,

  CONSTRAINT fk_tenant_app_meta_tenant_id
      FOREIGN KEY(tenant_id)
      REFERENCES tenant(id)
      DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_app_meta_tenant_id ON tenant_app_meta(tenant_id);

SELECT diesel_manage_updated_at('tenant_app_meta');