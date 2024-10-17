
WITH to_create AS (
    SELECT
        workflow_request.id as wfr_id,
        scoped_vault.id as sb_id
        -- workflow_id
    FROM workflow_request
    INNER JOIN scoped_vault ON fp_id = config->'data'->>'fp_bid'
    WHERE config->>'kind' = 'document' AND config->'data'->>'fp_bid' IS NOT NULL
)
INSERT INTO workflow_request_junction (
    kind,
    workflow_request_id,
    scoped_vault_id,
    workflow_id
)
SELECT
    'business',
    wfr_id,
    sb_id,
    -- It will be harder to backfill these..... I might do this manually
    -- Only a few businesses have multiple WFRs:
    -- select fp_id, tenant_id, count(*) from workflow_request inner join scoped_vault on fp_id = config->'data'->>'fp_bid' where config->>'kind' = 'document' and config->'data'->>'fp_bid' is not null group by 1, 2 having count(*) > 1;
    null
FROM to_create
WHERE NOT EXISTS (
    SELECT 1
    FROM workflow_request_junction wfrj
    WHERE wfrj.workflow_request_id = to_create.wfr_id AND wfrj.scoped_vault_id = to_create.sb_id
);
