ALTER TABLE compliance_doc_request
  ADD COLUMN deactivated_by_partner_tenant_user_id TEXT;

ALTER TABLE compliance_doc_request
  ADD CONSTRAINT fk_compliance_doc_request_deactivated_by_partner_tenant_user_id
    FOREIGN KEY(deactivated_by_partner_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS compliance_doc_request_deactivated_by_partner_tenant_user_id ON compliance_doc_request(deactivated_by_partner_tenant_user_id);

