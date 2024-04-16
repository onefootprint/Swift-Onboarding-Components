-- TODO(eforde): run this in prod in batches before merging

WITH doc_reqs_to_update AS (
    SELECT id
    FROM document_request
    WHERE config IS NULL
)
UPDATE document_request
SET config = CASE
    WHEN kind = 'identity' THEN jsonb_build_object('kind', kind, 'data', jsonb_build_object('collect_selfie', should_collect_selfie))
    ELSE jsonb_build_object('kind', kind, 'data', jsonb_build_object())
END
WHERE id in (SELECT id FROM doc_reqs_to_update);