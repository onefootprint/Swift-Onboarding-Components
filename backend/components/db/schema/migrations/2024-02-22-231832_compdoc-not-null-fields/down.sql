ALTER TABLE compliance_doc_spec ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE compliance_doc_submission ALTER COLUMN submitted_by_tenant_user_id DROP NOT NULL;
ALTER TABLE compliance_doc_review ALTER COLUMN reviewed_by_tenant_user_id DROP NOT NULL;
