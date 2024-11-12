CREATE TABLE playbook (
  id TEXT PRIMARY KEY DEFAULT prefixed_uid ('pb_'),
  _created_at timestamptz NOT NULL DEFAULT NOW (),
  _updated_at timestamptz NOT NULL DEFAULT NOW (),
  key TEXT UNIQUE NOT NULL,
  tenant_id TEXT NOT NULL,
  is_live BOOLEAN NOT NULL,
  status TEXT NOT NULL,

  CONSTRAINT fk_playbook_tenant_id
    FOREIGN KEY (tenant_id)
    REFERENCES tenant (id)
    DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at ('playbook');

ALTER TABLE ob_configuration
  ADD COLUMN playbook_id TEXT,
  ADD COLUMN deactivated_at TIMESTAMPTZ,
  ADD CONSTRAINT fk_ob_configuration_playbook_id
    FOREIGN KEY (playbook_id)
    REFERENCES playbook (id)
    DEFERRABLE INITIALLY DEFERRED NOT VALID;
