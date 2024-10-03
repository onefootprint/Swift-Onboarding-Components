-- Step 1: for RSGs whose risk signals all came from one workflow, set the workflow_id
WITH rsg_to_workflow_id as (
    select 
        rsg.id as rsg_id,
        di.workflow_id as workflow_id
    from risk_signal rs
    join risk_signal_group rsg on rs.risk_signal_group_id = rsg.id
    join verification_result vres on vres.id = rs.verification_result_id
    join verification_request vreq on vreq.id = vres.request_id
    join decision_intent di on di.id = vreq.decision_intent_id
    where
        di.workflow_id is not null
        and rsg.workflow_id is null
),
rsg_to_wf_count as (
    select rsg_id, max(workflow_id) as workflow_id, count(distinct workflow_id) as count
    from rsg_to_workflow_id
    group by 1
),
to_backfill as (
    select rsg_id, workflow_id
    from rsg_to_wf_count
    where count = 1
)
update risk_signal_group rsg
set workflow_id = bwf.workflow_id
from to_backfill bwf
where rsg.id = bwf.rsg_id ;

-- Step 2: for the KYB RSGs in sandbox that don't have any workflow_id associated with the DI, backfill which workflow they are likely attached to
-- We do this by computing which workflow was active when the RSes were created.
-- If all RSes in a single RSG have the same hypothetical wf_id, we set it.
WITH rs_to_workflow_id AS (
    SELECT
        risk_signal.id as rs_id,
        risk_signal.risk_signal_group_id as rsg_id,
        workflow.id as wf_id
    FROM risk_signal
    INNER JOIN risk_signal_group rsg
        ON rsg.id = risk_signal.risk_signal_group_id
    INNER JOIN scoped_vault
        ON rsg.scoped_vault_id = scoped_vault.id
    LEFT JOIN workflow
        -- Select the workflow for this user that was active when this risk signal was created
        ON workflow.scoped_vault_id = rsg.scoped_vault_id
        AND workflow._created_at < risk_signal._created_at
        AND (workflow.completed_at IS NULL OR workflow.completed_at > risk_signal._created_at)
        -- AND (workflow.deactivated_at IS NULL OR workflow.deactivated_at > risk_signal._created_at)
    WHERE
        rsg.kind = 'kyb'
        AND rsg.workflow_id IS NULL
),
rsg_to_wf_count as (
    select rsg_id, max(wf_id) as wf_id, count(distinct wf_id) as count
    from rs_to_workflow_id
    group by 1
),
to_backfill as (
    select rsg_id, wf_id
    from rsg_to_wf_count
    where count = 1
)
update risk_signal_group rsg
set workflow_id = bwf.wf_id
from to_backfill bwf
where rsg.id = bwf.rsg_id ;


-- For all other RSGs whose RSes came from multiple workflow_ids, make a RSG for every KYB workflow that has risk signals generated during it
WITH rs_to_workflow_id AS (
    SELECT
        risk_signal.id as rs_id,
        risk_signal.risk_signal_group_id as rsg_id,
        workflow.id as wf_id,
        risk_signal.reason_code,
        rsg.scoped_vault_id,
        rsg.kind as rsg_kind,
        risk_signal._created_at,
        workflow.created_at as wf_created_at,
        workflow.deactivated_at
    FROM risk_signal_group rsg
    INNER JOIN risk_signal
        ON rsg.id = risk_signal.risk_signal_group_id
    INNER JOIN scoped_vault
        ON rsg.scoped_vault_id = scoped_vault.id
    LEFT JOIN workflow
        -- Select the workflow for this user that was active when this risk signal was created
        ON workflow.scoped_vault_id = rsg.scoped_vault_id
        AND workflow._created_at < risk_signal._created_at
        AND (workflow.completed_at IS NULL OR workflow.completed_at > risk_signal._created_at)
        -- AND (workflow.deactivated_at IS NULL OR workflow.deactivated_at > risk_signal._created_at)
    WHERE
        rsg.kind = 'kyb'
        AND rsg.workflow_id IS NULL
),
rsgs_to_create AS (
    select distinct wf_id, rsg_kind, scoped_vault_id, wf_created_at
    from rs_to_workflow_id
    where
        wf_id is not null
        and not exists (select * from risk_signal_group where workflow_id = wf_id and kind = rsg_kind)
)
-- Create a new RSG for every workflow represented by the RSes
insert into risk_signal_group (workflow_id, kind, scoped_vault_id, created_at)
select wf_id, rsg_kind, scoped_vault_id, wf_created_at from rsgs_to_create
returning
    id as rsg_id,
    workflow_id;



-- Update all risk signals to point to the RSG linked to the correct workflow
WITH rs_to_workflow_id AS (
    SELECT
        risk_signal.id as rs_id,
        risk_signal.risk_signal_group_id as rsg_id,
        workflow.id as wf_id,
        risk_signal.reason_code,
        rsg.scoped_vault_id,
        rsg.kind as rsg_kind,
        risk_signal._created_at,
        workflow.created_at as wf_created_at,
        workflow.deactivated_at
    FROM risk_signal_group rsg
    INNER JOIN risk_signal
        ON rsg.id = risk_signal.risk_signal_group_id
    INNER JOIN scoped_vault
        ON rsg.scoped_vault_id = scoped_vault.id
    LEFT JOIN workflow
        -- Select the workflow for this user that was active when this risk signal was created
        ON workflow.scoped_vault_id = rsg.scoped_vault_id
        AND workflow._created_at < risk_signal._created_at
        AND (workflow.completed_at IS NULL OR workflow.completed_at > risk_signal._created_at)
        -- AND (workflow.deactivated_at IS NULL OR workflow.deactivated_at > risk_signal._created_at)
    WHERE
        rsg.kind = 'kyb'
        AND rsg.workflow_id IS NULL
),
to_update as (
    select
        rs_id, rsg.id as rsg_id
    from rs_to_workflow_id
    inner join risk_signal_group rsg
        on wf_id = rsg.workflow_id and kind = rsg.kind
)
update risk_signal
set risk_Signal_group_id = to_update.rsg_id
from to_update
where risk_signal.id = to_update.rs_id
returning id, risk_signal_group_id;


-- I think there are some legacy KYB RSGs that were made after the workflow? So going to associate them with the one workflow for the user
WITH rs_to_workflow_id AS (
    SELECT
        rsg.id as rsg_id,
        workflow.id as wf_id,
        workflow.scoped_vault_id
    FROM risk_signal_group rsg
    INNER JOIN scoped_vault
        ON rsg.scoped_vault_id = scoped_vault.id
    INNER JOIN tenant
        ON tenant_id = tenant.id
    LEFT JOIN workflow
        ON workflow.scoped_vault_id = rsg.scoped_vault_id
    WHERE
        rsg.kind = 'kyb'
        AND rsg.workflow_id IS NULL
        AND exists (
            select * from risk_signal where risk_signal_group_id = rsg.id
        )
),
rsg_to_wf_count as (
    select rsg_id, max(wf_id) as wf_id, scoped_vault_id, count(distinct wf_id) as count
    from rs_to_workflow_id
    group by 1, 3
),
to_backfill as (
    select *
    from rsg_to_wf_count
    where count = 1
)
update risk_signal_group rsg
set workflow_id = bwf.wf_id
from to_backfill bwf
where rsg.id = bwf.rsg_id ;