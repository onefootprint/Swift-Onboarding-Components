DROP TABLE IF EXISTS audit_log;

CREATE TABLE audit_event (
  id TEXT PRIMARY KEY DEFAULT prefixed_uid('ae_'),
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  timestamp timestamptz NOT NULL,

  tenant_id text NOT NULL,
  CONSTRAINT fk_audit_event_tenant_id
      FOREIGN KEY(tenant_id)
      REFERENCES tenant(id)
      DEFERRABLE INITIALLY DEFERRED,

  event_name TEXT NOT NULL,
  principal_actor jsonb,

  insight_event_id TEXT NOT NULL,
  CONSTRAINT fk_audit_event_insight_event_id
      FOREIGN KEY(insight_event_id)
      REFERENCES insight_event(id)
      DEFERRABLE INITIALLY DEFERRED,

  metadata jsonb NOT NULL,

  scoped_vault_id TEXT,
  CONSTRAINT fk_audit_event_scoped_vault_id
      FOREIGN KEY(scoped_vault_id)
      REFERENCES scoped_vault(id)
      DEFERRABLE INITIALLY DEFERRED,

  ob_configuration_id TEXT,
  CONSTRAINT fk_audit_event_ob_configuration_id
      FOREIGN KEY(ob_configuration_id)
      REFERENCES ob_configuration(id)
      DEFERRABLE INITIALLY DEFERRED,

  document_data_id TEXT,
  CONSTRAINT fk_audit_event_document_data_id
      FOREIGN KEY(document_data_id)
      REFERENCES document_data(id)
      DEFERRABLE INITIALLY DEFERRED,

  tenant_api_key_id TEXT,
  CONSTRAINT fk_audit_event_tenant_api_key_id
      FOREIGN KEY(tenant_api_key_id)
      REFERENCES tenant_api_key(id)
      DEFERRABLE INITIALLY DEFERRED,

  tenant_user_id TEXT,
  CONSTRAINT fk_audit_event_tenant_user_id
      FOREIGN KEY(tenant_user_id)
      REFERENCES tenant_user(id)
      DEFERRABLE INITIALLY DEFERRED,

  tenant_role_id TEXT,
  CONSTRAINT fk_audit_event_tenant_role_id
      FOREIGN KEY(tenant_role_id)
      REFERENCES tenant_role(id)
      DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS audit_event_tenant_id ON audit_event(tenant_id);
CREATE INDEX IF NOT EXISTS audit_event_insight_event_id ON audit_event(insight_event_id);
CREATE INDEX IF NOT EXISTS audit_event_scoped_vault_id ON audit_event(scoped_vault_id);
CREATE INDEX IF NOT EXISTS audit_event_ob_configuration_id ON audit_event(ob_configuration_id);
CREATE INDEX IF NOT EXISTS audit_event_document_data_id ON audit_event(document_data_id);
CREATE INDEX IF NOT EXISTS audit_event_tenant_api_key_id ON audit_event(tenant_api_key_id);
CREATE INDEX IF NOT EXISTS audit_event_tenant_user_id ON audit_event(tenant_user_id);
CREATE INDEX IF NOT EXISTS audit_event_tenant_role_id ON audit_event(tenant_role_id);

SELECT diesel_manage_updated_at('audit_event');
