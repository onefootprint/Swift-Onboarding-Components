ALTER TABLE compliance_doc_submission ADD COLUMN compliance_doc_id TEXT;
ALTER TABLE compliance_doc_submission
  ADD CONSTRAINT fk_compliance_doc_submission_compliance_doc_id
    FOREIGN KEY(compliance_doc_id)
    REFERENCES compliance_doc(id)
    DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS compliance_doc_submission_compliance_doc_id ON compliance_doc_submission(compliance_doc_id);

ALTER TABLE compliance_doc_review ADD COLUMN compliance_doc_id TEXT;
ALTER TABLE compliance_doc_review
  ADD CONSTRAINT fk_compliance_doc_review_compliance_doc_id
    FOREIGN KEY(compliance_doc_id)
    REFERENCES compliance_doc(id)
    DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS compliance_doc_review_compliance_doc_id ON compliance_doc_review(compliance_doc_id);
