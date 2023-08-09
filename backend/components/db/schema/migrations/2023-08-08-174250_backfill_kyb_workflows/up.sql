-- For each business vault, get the count of non-complete KYC onboardings for BO's for that vault
WITH bo_kycs AS (                              
 SELECT 
    bo.business_vault_id,
  	COUNT(CASE WHEN ob_status IS NULL OR ob_status NOT IN ('fail','pass') THEN 1 ELSE NULL END) num_bos_not_completed_kyc
 FROM business_owner bo
 INNER JOIN scoped_vault bsv on bsv.vault_id = bo.business_vault_id
 LEFT JOIN (
    SELECT
   		sv.ob_configuration_id,
		sv.vault_id vault_id,
		ob.status ob_status
	FROM scoped_vault sv
    INNER JOIN onboarding ob
			ON ob.scoped_vault_id = sv.id 		
			AND sv.ob_configuration_id = ob.ob_configuration_id
  ) obs ON (obs.vault_id = bo.user_vault_id AND obs.ob_configuration_id = bsv.ob_configuration_id)
  GROUP BY 1
),
biz_obs_with_expected_kyb_state AS (
  SELECT
    -- commented out fields not needed but useful for debugging
	-- sv.vault_id,
    -- sv.id sv_id,
    -- sv.fp_id,
    -- sv.tenant_id,
	-- ob.id ob_id,
	-- sv.is_live,    
    -- ob.status,
	-- ob.authorized_at is not null authorized_is_set,
    -- ob.idv_reqs_initiated_at is not null idv_reqs_initiated_is_set,
    -- ob.decision_made_at is not null decision_made_at_is_set,
  	-- mr.state mr_state,
	-- bo_kycs.num_bos_not_completed_kyc,
    ob.start_timestamp ob_start_timestamp,
    ob.scoped_vault_id,
    case 
      WHEN ob.authorized_at is null or num_bos_not_completed_kyc is null then 'kyb.data_collection'
      WHEN ob.idv_reqs_initiated_at is null and num_bos_not_completed_kyc > 0 then 'kyb.awaiting_bo_kyc'
  	  WHEN ob.idv_reqs_initiated_at is null and num_bos_not_completed_kyc = 0 then 'kyb.vendor_calls'
      WHEN mr.state in ('awaiting_business_update_webhook', 'awaiting_tin_retry', 'pending_get_business_call') then 'kyb.awaiting_async_vendors'
      WHEN ob.status = 'pending' and mr.state = 'complete' then 'kyb.decisioning'
      WHEN ob.status in ('pass', 'fail') then 'kyb.complete'
 	  else NULL 
	end expected_kyb_wf_state
  	FROM onboarding ob
  	INNER JOIN scoped_vault sv ON ob.scoped_vault_id = sv.id
  	INNER JOIN vault v ON sv.vault_id = v.id
    LEFT JOIN bo_kycs ON bo_kycs.business_vault_id = v.id
    LEFT JOIN middesk_request mr ON mr.onboarding_id = ob.id
  	WHERE 
     	 v.kind = 'business' AND ob.workflow_id IS NULL
),

-- backfill would-have-been KYB workflows from existing onboarding's
backfilled_workflows as (
    INSERT INTO workflow(created_at, scoped_vault_id, kind, state, config)
    SELECT
        ob_start_timestamp, scoped_vault_id, 'kyb', expected_kyb_wf_state, '{"data": {}, "kind": "kyb"}'::json
    FROM biz_obs_with_expected_kyb_state
    RETURNING id, scoped_vault_id, state
),
-- backfill workflow_event's
-- kyb.data_collection -> kyb.awaiting_bo_kyc
insert_wfe1 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        -- we have a weird bug where for Sandbox KYB's, we are setting authorized_at again when we write the decision so this causes cases where authorized_at > idv_reqs_initiated_at :/
        LEAST(ob.idv_reqs_initiated_at, ob.authorized_at),
        wf.id,
        'kyb.data_collection',
        'kyb.awaiting_bo_kyc'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    WHERE 
        wf.state != 'kyb.data_collection'
),
-- kyb.awaiting_bo_kyc -> kyb.vendor_calls
insert_wfe2 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        -- there are some bugged KYB's which are authorized but KYB was never run because we were never triggering it in /proceeed. Technically this should be max(ob.decision_made_at) of all the BO's but thats not really worth the effort here so just using authorized_at as a proxy in these cases
        LEAST(ob.idv_reqs_initiated_at, ob.authorized_at), 
        wf.id,
        'kyb.awaiting_bo_kyc',
        'kyb.vendor_calls'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    WHERE 
        wf.state NOT IN ('kyb.data_collection', 'kyb.awaiting_bo_kyc')
),
-- kyb.vendor_calls -> kyb.decisioning for Sandbox
insert_wfe3 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        ob.decision_made_at,
        wf.id,
        'kyb.vendor_calls',
        'kyb.decisioning'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    INNER JOIN scoped_vault sv on ob.scoped_vault_id = sv.id
    WHERE 
        ob.decision_made_at IS NOT NULL
        AND sv.is_live = false
),
-- kyb.decisioning -> kyb.complete
insert_wfe4 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        ob.decision_made_at,
        wf.id,
        'kyb.decisioning',
        'kyb.complete'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    INNER JOIN scoped_vault sv on ob.scoped_vault_id = sv.id
    WHERE 
        ob.decision_made_at IS NOT NULL
),
-- kyb.vendor_calls -> kyb.awaiting_async_vendors
insert_wfe5 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        mr.created_at,
        wf.id,
        'kyb.vendor_calls',
        'kyb.awaiting_async_vendors'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    INNER JOIN middesk_request mr on mr.onboarding_id = ob.id
),
-- kyb.awaiting_async_vendors -> kyb.decisioning
insert_wfe6 AS (
    INSERT INTO workflow_event(created_at, workflow_id, from_state, to_state)
    SELECT 
        mr._updated_at,
        wf.id,
        'kyb.awaiting_async_vendors',
        'kyb.decisioning'
    FROM backfilled_workflows wf
    INNER JOIN onboarding ob 
        ON wf.scoped_vault_id = ob.scoped_vault_id
    INNER JOIN middesk_request mr on mr.onboarding_id = ob.id
    WHERE mr.state = 'complete'
)

-- update FK's in onboarding and onboarding_decision for those that are missing a workflow_id
UPDATE onboarding ob
SET workflow_id = wf.id
FROM backfilled_workflows wf
WHERE ob.scoped_vault_id = wf.scoped_vault_id AND ob.workflow_id is null;

UPDATE onboarding_decision obd
SET workflow_id = ob.workflow_id
FROM onboarding ob
WHERE 
    obd.onboarding_id = ob.id
    AND obd.workflow_id IS NULL
    AND obd.actor->>'kind'='footprint';
