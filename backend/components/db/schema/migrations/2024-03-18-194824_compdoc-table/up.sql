CREATE TABLE compliance_doc (
  id text PRIMARY KEY DEFAULT prefixed_uid('cd_'),

  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  tenant_compliance_partnership_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_tenant_compliance_partnership_id
    FOREIGN KEY(tenant_compliance_partnership_id)
    REFERENCES tenant_compliance_partnership(id)
    DEFERRABLE INITIALLY DEFERRED,

  template_id text,
  CONSTRAINT fk_compliance_doc_template_id
    FOREIGN KEY(template_id)
    REFERENCES compliance_doc_template(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Postgres considers nulls to be distinct by default.
  CONSTRAINT compliance_doc_unique_tenant_compliance_partnership_id_template_id
    UNIQUE(tenant_compliance_partnership_id, template_id)
);

CREATE INDEX IF NOT EXISTS compliance_doc_tenant_compliance_partnership_id ON compliance_doc(tenant_compliance_partnership_id);
CREATE INDEX IF NOT EXISTS compliance_doc_template_id ON compliance_doc(id);
SELECT diesel_manage_updated_at('compliance_doc');

ALTER TABLE compliance_doc_request ADD COLUMN compliance_doc_id text NOT NULL;
ALTER TABLE compliance_doc_request ADD CONSTRAINT fk_compliance_doc_request_compliance_doc_id
    FOREIGN KEY(compliance_doc_id)
    REFERENCES compliance_doc(id)
    DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS compliance_doc_request_compliance_doc_id ON compliance_doc_request(compliance_doc_id);

ALTER TABLE compliance_doc_request DROP COLUMN template_version_id;
ALTER TABLE compliance_doc_request DROP COLUMN tenant_compliance_partnership_id;

