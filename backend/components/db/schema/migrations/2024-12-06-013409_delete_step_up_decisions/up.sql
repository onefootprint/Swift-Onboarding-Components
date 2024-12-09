-- TODO: run before merging
CREATE TABLE onboarding_decision_verification_result_junction_step_up_12_15_2024 AS SELECT * from onboarding_decision_verification_result_junction where onboarding_decision_id in (select id from onboarding_decision where status = 'step_up');
CREATE TABLE onboarding_decision_step_up_12_15_2024 AS SELECT * from onboarding_decision where status = 'step_up';



with uts_to_delete as (
    select user_timeline.id as ut_it, scoped_vault_id, onboarding_decision.*
    from onboarding_decision
    inner join user_Timeline
        on (event_kind = 'onboarding_decision' and event->'data'->>'id' = onboarding_decision.id)
    where onboarding_decision.status = 'step_up'
)
delete from user_timeline where id in (select ut_it from uts_to_delete);

delete from onboarding_decision_verification_result_junction where onboarding_decision_id in (select id from onboarding_decision where status = 'step_up');

UPDATE manual_review SET completed_by_decision_id = null where completed_by_decision_id in (select id from onboarding_decision where status = 'step_up');

delete from onboarding_decision where status = 'step_up';