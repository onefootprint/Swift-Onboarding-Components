CREATE TABLE vault_dr_blob (
    id text PRIMARY KEY DEFAULT prefixed_uid('vdrb_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    created_at timestamptz NOT NULL,

    config_id TEXT NOT NULL,

    data_lifetime_id TEXT NOT NULL,
    -- Denormalize the created_at_seqno so we can order tasks without doing a large join.
    dl_created_at_seqno BIGINT NOT NULL,

    bucket_path TEXT NOT NULL,

    -- Store both ETag (semi-opaque, more integrated with cloud APIs) and MD5
    -- (something customers can compute to help us debug).
    content_etag TEXT NOT NULL,
    content_md5 TEXT NOT NULL,

    wrapped_record_key TEXT NOT NULL,

    CONSTRAINT fk_vault_dr_blob_config_id
        FOREIGN KEY(config_id)
        REFERENCES vault_dr_config(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_vault_dr_blob_data_lifetime_id
        FOREIGN KEY(data_lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED

);
SELECT diesel_manage_updated_at('vault_dr_blob');
CREATE INDEX IF NOT EXISTS vault_dr_blob_created_at ON vault_dr_blob(created_at);
CREATE INDEX IF NOT EXISTS vault_dr_blob_config_id ON vault_dr_blob(config_id);
CREATE INDEX IF NOT EXISTS vault_dr_blob_data_lifetime_id ON vault_dr_blob(data_lifetime_id);
CREATE INDEX IF NOT EXISTS vault_dr_blob_dl_created_at_seqno ON vault_dr_blob(dl_created_at_seqno);
