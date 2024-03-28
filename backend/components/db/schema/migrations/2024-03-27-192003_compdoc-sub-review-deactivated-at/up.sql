ALTER TABLE compliance_doc_submission
  ADD COLUMN deactivated_at TIMESTAMPTZ;
CREATE INDEX compliance_doc_submission_compliance_doc_request_id_unique_active
  ON compliance_doc_submission(request_id)
  WHERE deactivated_at IS NULL;

ALTER TABLE compliance_doc_review
  ADD COLUMN deactivated_at TIMESTAMPTZ;
CREATE INDEX compliance_doc_review_compliance_doc_submission_id_unique_active
  ON compliance_doc_review(submission_id)
  WHERE deactivated_at IS NULL;
