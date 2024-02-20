-- some workflows have more than 1 Footprint OBD (because we manually decisioned them post initial onboarding)
-- so we make sure to take the first OBD per workflow
with wf_obds as (
	select
		distinct on(workflow_id) 
		workflow_id, 
		id,
		_created_at, 
		rule_set_result_id
	from onboarding_decision
	where 
		actor->>'kind' = 'footprint'
	order by workflow_id, _created_at asc
),
obds_to_update as (
    select
        distinct on(obd.id) obd.id obd_id, rsr.id rsr_id
    from wf_obds obd
    inner join rule_set_result rsr 
        on obd.workflow_id = rsr.workflow_id
        and obd._created_at >= rsr._created_at --technically not needed, but nice
    where 
        obd.rule_set_result_id is null
        and obd._created_at >= '2023-12-13' --when we fully switched over to using new rules engine for decisioning
    order by obd.id, rsr.created_at desc -- take the most recent rule_set_result right before this OBD was created and assign that id to the OBD
    limit 0 --manually run in batches
)

update onboarding_decision
set rule_set_result_id = u.rsr_id
from obds_to_update u
where onboarding_decision.id = u.obd_id;

