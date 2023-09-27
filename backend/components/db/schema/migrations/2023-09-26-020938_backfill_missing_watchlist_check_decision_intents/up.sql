-- decision_intent's that are kind = 'onboarding_kyc' but have only Incode watchlist api calls
with miskinded_decision_intents as (
    select 
	    di.id di_id
    from verification_request vreq
    inner join decision_intent di on vreq.decision_intent_id = di.id
    where 
        di.kind = 'onboarding_kyc'
    group by 1  
    having count(*) = count(case when vendor_api 
        in ('incode_start_onboarding', 'incode_watchlist_check') then 1 else null end)
)

update decision_intent di
set kind = 'watchlist_check'
from miskinded_decision_intents mdi
where 
    di.id = mdi.di_id;