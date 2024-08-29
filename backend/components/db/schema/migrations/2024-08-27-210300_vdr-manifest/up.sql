CREATE TABLE vault_dr_manifest (
    id text PRIMARY KEY DEFAULT prefixed_uid('vdrm_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    config_id TEXT NOT NULL,

    scoped_vault_version_id TEXT NOT NULL,
    bucket_path TEXT NOT NULL,

    -- Store both ETag (semi-opaque, more integrated with cloud APIs) and MD5
    -- (something customers can compute to help us debug).
    content_etag TEXT NOT NULL,
    content_length_bytes BIGINT NOT NULL,

    CONSTRAINT fk_vault_dr_manifest_config_id
        FOREIGN KEY(config_id)
        REFERENCES vault_dr_config(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_vault_dr_manifest_scoped_vault_version_id
        FOREIGN KEY(scoped_vault_version_id)
        REFERENCES scoped_vault_version(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('vault_dr_manifest');
CREATE INDEX IF NOT EXISTS vault_dr_manifest_config_id ON vault_dr_manifest(config_id);
CREATE INDEX IF NOT EXISTS vault_dr_manifest_scoped_vault_version_id ON vault_dr_manifest(scoped_vault_version_id);
