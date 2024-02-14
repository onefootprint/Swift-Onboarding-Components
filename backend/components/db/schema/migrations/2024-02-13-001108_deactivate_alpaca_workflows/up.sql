update workflow
set deactivated_at = now()
where 
    deactivated_at is null
    and state in ('alpaca_kyc.data_collection', 'alpaca_kyc.doc_collection');

update workflow
set completed_at = now(), state = 'alpaca_kyc.complete'
where 
    state = 'alpaca_kyc.pending_review';
