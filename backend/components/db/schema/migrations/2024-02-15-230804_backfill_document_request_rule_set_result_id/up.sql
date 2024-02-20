with doc_reqs_to_update as (
    select
        distinct on (dr.id)
        dr.id dr_id,
        rsr.id rsr_id
    from rule_set_result rsr
    inner join document_request dr 
        on (rsr.workflow_id = dr.workflow_id and dr._created_at >= rsr._created_at)
    where
        rsr.action_triggered like '%step_up%'
        and dr.rule_set_result_id is null
        and rsr._created_at >= '2023-12-13'
    order by dr.id, rsr.created_at desc --take the most recent step_up rule_set_result created before this doc_req
    limit 0 --run manually in batches
)

update document_request
set rule_set_result_id = u.rsr_id
from doc_reqs_to_update u
where document_request.id = u.dr_id;



