CREATE INDEX IF NOT EXISTS compliance_doc_request_compliance_doc_id_unique_active
  ON compliance_doc_request(compliance_doc_id)
  WHERE deactivated_at IS NULL;
