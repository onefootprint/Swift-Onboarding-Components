CREATE TABLE tenant_android_app_meta (
  id TEXT PRIMARY KEY DEFAULT prefixed_uid('taam_'),
  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  tenant_id TEXT NOT NULL,
  package_names TEXT[] NOT NULL,
  apk_cert_sha256s TEXT[] NOT NULL,
  e_integrity_verification_key BYTEA NOT NULL,
  e_integrity_decryption_key BYTEA NOT NULL,

  deactivated_at timestamptz,

  CONSTRAINT fk_tenant_android_app_meta_tenant_id
      FOREIGN KEY(tenant_id)
      REFERENCES tenant(id)
      DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_android_app_meta_tenant_id ON tenant_android_app_meta(tenant_id);

SELECT diesel_manage_updated_at('tenant_android_app_meta');