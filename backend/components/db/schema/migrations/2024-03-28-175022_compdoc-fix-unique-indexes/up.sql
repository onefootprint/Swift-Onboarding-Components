----- REQUESTS
UPDATE compliance_doc_request
SET deactivated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id, rank()
      OVER (PARTITION BY compliance_doc_id ORDER BY created_at DESC)
      FROM compliance_doc_request
      WHERE deactivated_at IS NULL
  ) AS ranked WHERE rank > 1
);
DROP INDEX IF EXISTS compliance_doc_request_compliance_doc_id_unique_active;
CREATE UNIQUE INDEX IF NOT EXISTS compliance_doc_request_unique_active
  ON compliance_doc_request(compliance_doc_id)
  WHERE deactivated_at IS NULL;

----- SUBMISSIONS
UPDATE compliance_doc_submission
SET deactivated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id, rank()
      OVER (PARTITION BY request_id ORDER BY created_at DESC)
      FROM compliance_doc_submission
      WHERE deactivated_at IS NULL
  ) AS ranked WHERE rank > 1
);

-- n.b. index name was truncated
DROP INDEX IF EXISTS compliance_doc_submission_compliance_doc_request_id_unique_acti;
UPDATE compliance_doc_submission SET deactivated_at = NOW() WHERE deactivated_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS compliance_doc_submission_unique_active
  ON compliance_doc_submission(request_id)
  WHERE deactivated_at IS NULL;

----- REVIEWS
UPDATE compliance_doc_review
SET deactivated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id, rank()
      OVER (PARTITION BY submission_id ORDER BY created_at DESC)
      FROM compliance_doc_review
      WHERE deactivated_at IS NULL
  ) AS ranked WHERE rank > 1
);

-- n.b. index name was truncated
DROP INDEX IF EXISTS compliance_doc_review_compliance_doc_submission_id_unique_activ;
UPDATE compliance_doc_review SET deactivated_at = NOW() WHERE deactivated_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS compliance_doc_review_unique_active
  ON compliance_doc_review(submission_id)
  WHERE deactivated_at IS NULL;
