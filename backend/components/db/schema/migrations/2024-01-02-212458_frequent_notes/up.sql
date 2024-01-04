CREATE TABLE tenant_frequent_note (
  id TEXT PRIMARY KEY DEFAULT prefixed_uid('fn_'),
  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  tenant_id text NOT NULL,
  created_by_actor jsonb NOT NULL,
  kind TEXT NOT NULL,
  content TEXT NOT NULL,

  deactivated_at timestamptz,

  CONSTRAINT fk_tenant_frequent_notes_tenant_id
      FOREIGN KEY(tenant_id)
      REFERENCES tenant(id)
      DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_frequent_note_tenant_id ON tenant_frequent_note(tenant_id);

SELECT diesel_manage_updated_at('tenant_frequent_note');
