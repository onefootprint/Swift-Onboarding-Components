-- backfill would-have-been `kyc` workflows from existing onboarding's
WITH backfilled_workflows as (
    INSERT INTO workflow(created_at, scoped_vault_id, kind, state, config)
    SELECT
        ob.start_timestamp created_at,
        ob.scoped_vault_id,
        'kyc' kind,
        CASE
            WHEN ob.status = 'incomplete' OR ob.idv_reqs_initiated_at IS NULL THEN 'kyc.data_collection'
            WHEN ob.decision_made_at IS NULL THEN 'kyc.vendor_calls' -- we don’t need to disambiguate Decision here because (1) the MakeVendorCalls action in the KYC workflow will idempotently advance to Decisioning if all outstanding vreqs are completed and (2) we shouldn’t have any users stuck with completed vreqs and no decision anyway 
            ELSE 'kyc.complete'
        END state,
        '{"data": {"is_redo": false}}'::json config
    FROM onboarding ob
    INNER JOIN scoped_vault sv ON ob.scoped_vault_id = sv.id
    INNER JOIN vault v ON sv.vault_id = v.id
    WHERE 
        v.kind = 'person'
        AND ob.workflow_id IS NULL
        AND ob.scoped_vault_id not in ( -- user doesn't have an existing onboarding workflow (that's not yet FK'd on onboarding)
            SELECT scoped_vault_id FROM workflow 
            WHERE 
                kind IN ('kyc', 'alpaca_kyc')
                AND COALESCE(config->'data'->>'is_redo' = 'false', false)
        )
    RETURNING id, scoped_vault_id, state
),
-- backfill workflow_event's
insert_wfe1 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        ob.idv_reqs_initiated_at,
        wf.id,
        'kyc.data_collection',
        'kyc.vendor_calls'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    WHERE 
        wf.state in ('kyc.vendor_calls', 'kyc.complete')
), 
insert_wfe2 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        ob.decision_made_at,
        wf.id,
        'kyc.decisioning',
        'kyc.complete'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    WHERE 
        wf.state = 'kyc.complete'
)
INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
SELECT 
    (
        SELECT MAX(vres.timestamp)
        FROM verification_result vres 
        INNER JOIN verification_request vreq 
            ON vres.request_id = vreq.id
        WHERE 
            vreq.scoped_vault_id = ob.scoped_vault_id
    ),
    wf.id,
    'kyc.vendor_calls',
    'kyc.decisioning'
FROM backfilled_workflows wf
INNER JOIN onboarding ob 
    ON wf.scoped_vault_id = ob.scoped_vault_id
WHERE 
    wf.state = 'kyc.complete';

-- get the newly created workflows as well as any existing ones (should only have some alpaca_kyc ones existing from integration tests in prod and mb some real ones in dev)
WITH onboarding_workflows AS (
    SELECT *
    FROM workflow 
    WHERE 
        kind IN ('kyc', 'alpaca_kyc')
        AND COALESCE(config->'data'->>'is_redo' = 'false', false)
)
-- update FK's in onboarding and onboarding_decision for those that are missing a workflow_id
UPDATE onboarding ob
SET workflow_id = wf.id
FROM onboarding_workflows wf
INNER JOIN onboarding ob2
    ON ob2.scoped_vault_id = wf.scoped_vault_id
WHERE ob.id = ob2.id AND ob.workflow_id is null;

UPDATE onboarding_decision obd
SET workflow_id = ob.workflow_id
FROM onboarding ob
WHERE obd.onboarding_id = ob.id AND obd.workflow_id is null AND actor->>'kind'='footprint';
