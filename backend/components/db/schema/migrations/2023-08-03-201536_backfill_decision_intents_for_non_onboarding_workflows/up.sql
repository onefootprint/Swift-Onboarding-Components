CREATE VIEW non_onboarding_workflow_vreqs AS (
    -- get start and end times of Workflows by using wf.created_at and the timestamp from latest workflow_event
    WITH wf_timestamps AS (
        SELECT
            wf.scoped_vault_id, 
            wf.id wf_id, 
            wf.created_at wf_created_at, 
            MAX(wfe.created_at) wfe_max_created_at
        FROM workflow wf
        LEFT JOIN workflow_event wfe ON wfe.workflow_id = wf.id
        GROUP BY 1,2
    ),
    -- get users that have more than 1 workflow
    svs_with_multiple_wfs AS (
        SELECT 
            scoped_vault_id
        FROM wf_timestamps
        GROUP BY 1
        HAVING COUNT(*) > 1
    ),
    -- join vreqs for those users with workflows using the workflow timestamps 
    vreqs_with_wf AS (
        SELECT 
            vreq.id vreq_id, 
            vreq.vendor_api, 
            vreq.timestamp vreq_timestamp,
            vreq.scoped_vault_id vreq_svid,
            vreq.decision_intent_id di_id,
            wft.*
        FROM verification_request vreq
        INNER JOIN svs_with_multiple_wfs svs ON vreq.scoped_vault_id = svs.scoped_vault_id
        LEFT JOIN wf_timestamps wft ON
            (vreq.scoped_vault_id = wft.scoped_vault_id 
            AND vreq.timestamp > wft.wf_created_at AND vreq.timestamp < wft.wfe_max_created_at)
    ),
    -- dileneate the first WF for each user so we can ignore these. We only need to backfill synthetic DI's for the subsequent workflows that have the same DI as the first workflow
    first_wf_for_sv AS (
        SELECT 
            DISTINCT ON (wf.scoped_vault_id) wf.id wf_id, di.id di_id
        FROM workflow wf
        INNER JOIN decision_intent di ON di.workflow_id = wf.id
        ORDER BY wf.scoped_vault_id, wf.created_at ASC
    )
    -- filter down to only the non-first workflows
    SELECT 
        vwf.vreq_id, vwf.wf_id, vwf.scoped_vault_id, vwf.vreq_timestamp
    FROM vreqs_with_wf vwf
    INNER JOIN first_wf_for_sv fwf ON fwf.di_id = vwf.di_id
    WHERE fwf.wf_id != vwf.wf_id
);

-- Create 1 DI for every unique Workflow in our set of vreqs that need new backfilled DI's
WITH workflows_needing_new_di AS (
    SELECT 
        wf_id, scoped_vault_id, MIN(vreq_timestamp) min_vreq_timestamp 
    FROM non_onboarding_workflow_vreqs
    GROUP BY 1,2
),
backfilled_decision_intents AS (
    INSERT INTO decision_intent(scoped_vault_id, created_at, kind, workflow_id)
    SELECT scoped_vault_id, min_vreq_timestamp, 'onboarding_kyc', wf_id
    FROM workflows_needing_new_di
    RETURNING id, workflow_id
)

UPDATE verification_request vreq
SET decision_intent_id = bdi.id
FROM backfilled_decision_intents bdi
INNER JOIN non_onboarding_workflow_vreqs wfvr ON bdi.workflow_id = wfvr.wf_id
WHERE 
    vreq.id = wfvr.vreq_id;

DROP VIEW non_onboarding_workflow_vreqs;