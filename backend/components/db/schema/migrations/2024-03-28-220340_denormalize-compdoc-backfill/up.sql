UPDATE compliance_doc_submission
  SET compliance_doc_id = compliance_doc_request.compliance_doc_id
  FROM compliance_doc_request
  WHERE compliance_doc_request.id = compliance_doc_submission.request_id
  AND compliance_doc_submission.compliance_doc_id IS NULL;

UPDATE compliance_doc_review
  SET compliance_doc_id = compliance_doc_submission.compliance_doc_id
  FROM compliance_doc_submission
  WHERE compliance_doc_submission.id = compliance_doc_review.submission_id
  AND compliance_doc_review.compliance_doc_id IS NULL;
