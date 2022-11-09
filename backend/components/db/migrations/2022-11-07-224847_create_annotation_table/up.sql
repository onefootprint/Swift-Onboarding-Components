CREATE TABLE annotation (
    id text PRIMARY KEY DEFAULT prefixed_uid('annotation_'),
    timestamp TIMESTAMPTZ NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    scoped_user_id TEXT NOT NULL,
    tenant_user_id TEXT,
    note TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL,
    CONSTRAINT fk_annotation_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id),
    CONSTRAINT fk_annotation_tenant_user_id
        FOREIGN KEY(tenant_user_id)
        REFERENCES tenant_user(id)
);

CREATE INDEX IF NOT EXISTS annotation_scoped_user_id ON annotation(scoped_user_id);
CREATE INDEX IF NOT EXISTS annotation_tenant_user_id ON annotation(tenant_user_id);

SELECT diesel_manage_updated_at('annotation');
