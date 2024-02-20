with stepup_doc_reqs as (
  select
      rule_set_result_id, array_agg(id) doc_req_ids
  from document_request
  where 
      rule_set_result_id is not null
  group by 1
),
backfill as (
    select 
        rule_set_result_id,
        doc_req_ids
    from stepup_doc_reqs sdr
    left join user_timeline ut 
        on (ut.event_kind = 'step_up' and ut.event->'data'->'document_request_ids' ?| sdr.doc_req_ids) --don't backfill if those doc reqs already have a timeline event made for them
    where 
        ut.id is null
    limit 0 --run manually in batches
)

insert into user_timeline(scoped_vault_id, event, timestamp, vault_id, event_kind)
select 
  sv.id,
  json_build_object('kind', 'step_up', 'data', json_build_object('document_request_ids', b.doc_req_ids)),
  rsr.created_at,
  sv.vault_id,
  'step_up'
from backfill b
inner join rule_set_result rsr on b.rule_set_result_id = rsr.id
inner join scoped_vault sv on rsr.scoped_vault_id = sv.id;