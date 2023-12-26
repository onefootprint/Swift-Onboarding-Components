CREATE TABLE scoped_vault_label (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('label_'),  
    created_at timestamptz NOT NULL,
    deactivated_at timestamptz,
    created_seqno BIGINT NOT NULL,
    deactivated_seqno BIGINT,
    scoped_vault_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_scoped_vault_label_scoped_vault_id
        FOREIGN KEY(scoped_vault_id)
        REFERENCES scoped_vault(id)

);

CREATE UNIQUE INDEX IF NOT EXISTS scoped_vault_label_unique_active_scoped_vault_id ON scoped_vault_label(scoped_vault_id) where deactivated_at IS NULL;
CREATE INDEX IF NOT EXISTS scoped_vault_label_scoped_vault_id ON scoped_vault_label(scoped_vault_id);


CREATE TABLE scoped_vault_tag (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('tag_'),  
    created_at timestamptz NOT NULL,
    deactivated_at timestamptz,
    created_seqno BIGINT NOT NULL,
    deactivated_seqno BIGINT,
    scoped_vault_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_scoped_vault_tag_scoped_vault_id
        FOREIGN KEY(scoped_vault_id)
        REFERENCES scoped_vault(id)
);

CREATE INDEX IF NOT EXISTS scoped_vault_tag_active_scoped_vault_id ON scoped_vault_tag(scoped_vault_id) where deactivated_at IS NULL;
CREATE INDEX IF NOT EXISTS scoped_vault_tag_scoped_vault_id ON scoped_vault_label(scoped_vault_id);
