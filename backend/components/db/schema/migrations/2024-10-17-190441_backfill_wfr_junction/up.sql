WITH to_create AS (
    SELECT
        id as wfr_id,
        scoped_vault_id,
        workflow_id
    FROM workflow_request
)
INSERT INTO workflow_request_junction (
    kind,
    workflow_request_id,
    scoped_vault_id,
    workflow_id
)
SELECT
    'person',
    wfr_id,
    scoped_vault_id,
    workflow_id
FROM to_create
WHERE NOT EXISTS (
    SELECT 1
    FROM workflow_request_junction wfrj
    WHERE wfrj.workflow_request_id = to_create.wfr_id AND wfrj.scoped_vault_id = to_create.scoped_vault_id
);
