-- Requests already have the unique constraint.

----- SUBMISSIONS
LOCK TABLE compliance_doc_submission;
DROP INDEX IF EXISTS compliance_doc_submission_unique_active;

UPDATE compliance_doc_submission
SET deactivated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id, rank()
      OVER (PARTITION BY compliance_doc_id ORDER BY created_at DESC)
      FROM compliance_doc_submission
      WHERE deactivated_at IS NULL
  ) AS ranked WHERE rank > 1
);

DROP INDEX IF EXISTS compliance_doc_submission_unique_active;
CREATE UNIQUE INDEX IF NOT EXISTS compliance_doc_submission_req_unique_active
  ON compliance_doc_submission(request_id)
  WHERE deactivated_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS compliance_doc_submission_doc_unique_active
  ON compliance_doc_submission(compliance_doc_id)
  WHERE deactivated_at IS NULL;

----- REVIEWS
LOCK TABLE compliance_doc_review;
UPDATE compliance_doc_review
SET deactivated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id, rank()
      OVER (PARTITION BY compliance_doc_id ORDER BY created_at DESC)
      FROM compliance_doc_review
      WHERE deactivated_at IS NULL
  ) AS ranked WHERE rank > 1
);

DROP INDEX IF EXISTS compliance_doc_review_unique_active;
CREATE UNIQUE INDEX IF NOT EXISTS compliance_doc_review_sub_unique_active
  ON compliance_doc_review(submission_id)
  WHERE deactivated_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS compliance_doc_review_doc_unique_active
  ON compliance_doc_review(compliance_doc_id)
  WHERE deactivated_at IS NULL;
