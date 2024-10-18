WITH to_update AS (
    SELECT
        workflow_request_junction.id as wfrj_id,
        workflow_request.id as wfr_id,
        workflow.id as wf_id
    FROM workflow
    INNER JOIN workflow_request_junction
        INNER JOIN workflow_request ON workflow_request_junction.workflow_request_id = workflow_request.id
        ON workflow.scoped_vault_id = workflow_request_junction.scoped_vault_id
        AND workflow.created_at > workflow_request._created_at AND (workflow.created_at < workflow_request.deactivated_at OR workflow_request.deactivated_at IS NULL)
        AND workflow.kind = 'document'
        -- Ignore workflows that are already associated with a WFRJ
        AND NOT EXISTS (
            SELECT 1 FROM workflow_request_junction wfrj_2
            WHERE wfrj_2.workflow_id = workflow.id
        )
    WHERE
        workflow_request_junction.workflow_id IS NULL
        AND workflow_request_junction.kind = 'business'
),
counts as (
    SELECT
        wfrj_id,
        count(distinct wf_id) as count
    FROM to_update
    GROUP BY 1
)
UPDATE workflow_request_junction
SET workflow_id = to_update.wf_id
FROM to_update
WHERE
    to_update.wfrj_id = workflow_request_junction.id
    -- Only update if there's only one possible WF that could be associated with this WFRJ
    AND EXISTS (SELECT 1 FROM counts WHERE counts.wfrj_id = workflow_request_junction.id AND counts.count = 1)
;

