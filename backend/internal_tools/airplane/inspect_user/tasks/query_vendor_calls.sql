select
  vreq.id vreq_id, 
  vreq.timestamp vreq_timestamp,
  vreq.vendor_api,

  vres.is_error,
  cast(vres.response as varchar) response, --because airplane is a trashcan

  case 
    when vres.response->>'interviewId' is not null
    then 'https://dashboard.incode.com/single-session/' || cast(vres.response->>'interviewId' as varchar) 
    end inc_link,

  jsonb_path_query_first(vres.response, '$.clientResponsePayload.decisionElements.otherData.json.fraudSolutions.response.products.preciseIdServer.summary.scores.preciseIdScore') exp_score,
  jsonb_path_query_first(vres.response, '$.clientResponsePayload.decisionElements.matches') exp_matches,

  coalesce(
    vres.response->>'code',
    jsonb_path_query_first(vres.response, '$.clientResponsePayload.decisionElements.otherData.json.fraudSolutions.response.products.preciseIdServer.error')->>'errorCode',
    jsonb_path_query_first(vres.response, '$.clientResponsePayload.decisionElements.otherData.json.fraudSolutions.response.products.preciseIDServer.error')->>'errorCode'
  ) exp_error_code,

  coalesce(
    vres.response->>'description',
    jsonb_path_query_first(vres.response, '$.clientResponsePayload.decisionElements.otherData.json.fraudSolutions.response.products.preciseIdServer.error')->>'errorDescription',
    jsonb_path_query_first(vres.response, '$.clientResponsePayload.decisionElements.otherData.json.fraudSolutions.response.products.preciseIDServer.error')->>'errorDescription'
  ) exp_error_description,

  jsonb_path_query_first(vres.response, '$.response.results.key') ido_results_key,
  cast(jsonb_path_query_first(vres.response, '$.response.qualifiers') as varchar) ido_qualifiers, --because airplane is trash

  case 
    when vres.response->'response'->>'id-number' is not null
    then 'https://web.idologylive.com/reports/query.php'||:q||'id=' || cast(vres.response->'response'->>'id-number' as varchar) 
    end ido_link,

  vres.id vres_id,
  di.id di_id,
  di.kind di_kind,
  wf.id wf_id
from verification_request vreq
left join verification_result vres on vreq.id = vres.request_id
inner join decision_intent di on di.id = vreq.decision_intent_id
left join workflow wf on di.workflow_id = wf.id
inner join scoped_vault sv on vreq.scoped_vault_id = sv.id
where 
sv.fp_id = :fp_id
and vreq.vendor != 'stytch'
order by vreq.timestamp asc