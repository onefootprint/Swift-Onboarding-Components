DROP TABLE compliance_doc_assignment;

ALTER TABLE compliance_doc_request
  ADD COLUMN assigned_to_tenant_user_id TEXT;
ALTER TABLE compliance_doc_request
  ADD CONSTRAINT fk_compliance_doc_request_assigned_to_tenant_user_id
    FOREIGN KEY(assigned_to_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS compliance_doc_request_assigned_to_tenant_user_id ON compliance_doc_request(assigned_to_tenant_user_id);

ALTER TABLE compliance_doc_submission
  ADD COLUMN assigned_to_partner_tenant_user_id TEXT;
ALTER TABLE compliance_doc_submission
  ADD CONSTRAINT fk_compliance_doc_submission_assigned_to_partner_tenant_user_id
    FOREIGN KEY(assigned_to_partner_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS compliance_doc_submission_assigned_to_partner_tenant_user_id ON compliance_doc_submission(assigned_to_partner_tenant_user_id);
