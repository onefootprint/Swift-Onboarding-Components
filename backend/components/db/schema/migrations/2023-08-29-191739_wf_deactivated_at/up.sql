ALTER TABLE workflow ADD COLUMN deactivated_at TIMESTAMPTZ;


WITH updates AS (
    -- Select the created_at of the workflow that was made immediately after this one
    SELECT wf1.id, min(wf2.created_at) as next_wf_created_timestamp
    FROM workflow wf1
    INNER JOIN workflow wf2
        ON wf1.scoped_vault_id = wf2.scoped_vault_id
        -- Get all the workflows made after this workflow.
        -- If wf1 were the most recently created wf, there would be no result
        AND wf2.created_at > wf1.created_at
    GROUP BY 1
)
UPDATE workflow SET
deactivated_at = updates.next_wf_created_timestamp
FROM updates
WHERE workflow.id = updates.id; 

CREATE UNIQUE INDEX workflow_one_active_per_scoped_vault ON workflow(scoped_vault_id) WHERE deactivated_at IS NULL;