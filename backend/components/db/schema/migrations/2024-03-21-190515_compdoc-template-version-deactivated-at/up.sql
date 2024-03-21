ALTER TABLE compliance_doc_template_version ADD COLUMN deactivated_at TIMESTAMPTZ;

-- Deactivate all test data so we can add the unique index.
UPDATE compliance_doc_template SET deactivated_at = NOW() WHERE deactivated_at IS NULL;
UPDATE compliance_doc_template_version SET deactivated_at = NOW() WHERE deactivated_at IS NULL;

CREATE UNIQUE INDEX compliance_doc_template_version_unique_active_template_id
  ON compliance_doc_template_version(template_id)
  WHERE deactivated_at IS NULL;
