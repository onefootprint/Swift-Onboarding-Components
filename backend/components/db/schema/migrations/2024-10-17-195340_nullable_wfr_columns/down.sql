UPDATE workflow_request
SET scoped_vault_id = workflow_request_junction.scoped_vault_id
FROM workflow_request_junction
WHERE
    workflow_request.id = workflow_request_junction.workflow_request_id
    AND workflow_request_junction.kind = 'person'
    AND workflow_request.scoped_vault_id IS NULL
;
ALTER TABLE workflow_request ALTER COLUMN scoped_vault_id SET NOT NULL;
