ALTER TABLE compliance_doc_request DROP COLUMN compliance_doc_id;

ALTER TABLE compliance_doc_request ADD COLUMN template_version_id text;
ALTER TABLE compliance_doc_request ADD CONSTRAINT fk_compliance_doc_request_template_version_id
    FOREIGN KEY(template_version_id)
    REFERENCES compliance_doc_template_version(id)
    DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE compliance_doc_request ADD COLUMN tenant_compliance_partnership_id text NOT NULL;
ALTER TABLE compliance_doc_request ADD CONSTRAINT fk_compliance_doc_request_tenant_compliance_partnership_id
    FOREIGN KEY(tenant_compliance_partnership_id)
    REFERENCES tenant_compliance_partnership(id)
    DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS compliance_doc_request_template_version_id ON compliance_doc_request(template_version_id);
CREATE INDEX IF NOT EXISTS compliance_doc_request_tenant_compliance_partnership_id ON compliance_doc_request(tenant_compliance_partnership_id);

DROP TABLE IF EXISTS compliance_doc;
