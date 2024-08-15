CREATE TABLE scoped_vault_version (
  id text PRIMARY KEY DEFAULT prefixed_uid('svv_'),
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  scoped_vault_id TEXT NOT NULL,
  seqno BIGINT NOT NULL,
  version BIGINT NOT NULL,

  CONSTRAINT fk_scoped_vault_version_scoped_vault_id
      FOREIGN KEY(scoped_vault_id)
      REFERENCES scoped_vault(id)
      DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('scoped_vault_version');

CREATE UNIQUE INDEX IF NOT EXISTS scoped_vault_version_scoped_vault_id_seqno ON scoped_vault_version(scoped_vault_id, seqno);
CREATE UNIQUE INDEX IF NOT EXISTS scoped_vault_version_scoped_vault_id_version ON scoped_vault_version(scoped_vault_id, version);
