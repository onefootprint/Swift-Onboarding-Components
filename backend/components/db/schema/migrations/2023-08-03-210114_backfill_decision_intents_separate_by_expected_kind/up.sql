
SET CONSTRAINTS ALL IMMEDIATE;
-- make a temporary column on DI so we can associate our synthetically created DI's with the DI they came from
ALTER TABLE decision_intent ADD COLUMN from_decision_intent_id TEXT;

-- use vendor_api to infer what di.kind we would have expected that vreq to be part of
WITH vreqs as (
    SELECT
    *, 
    CASE vendor_api
        WHEN 'idology_expect_id' then 'onboarding_kyc'
        WHEN 'twilio_lookup_v2' then 'onboarding_kyc'
        WHEN 'socure_id_plus' then 'onboarding_kyc'
        WHEN 'experian_precise_id' then 'onboarding_kyc'

        WHEN 'middesk_create_business' then 'onboarding_kyb'
        WHEN 'middesk_get_business' then 'onboarding_kyb'
        WHEN 'middesk_business_update_webhook' then 'onboarding_kyb'
        WHEN 'middesk_tin_retried_webhook' then 'onboarding_kyb'

        WHEN 'idology_pa' then 'watchlist_check'
        WHEN 'incode_watchlist_check' then 'watchlist_check'

        WHEN 'incode_start_onboarding' then 'doc_scan'
        WHEN 'incode_add_front' then 'doc_scan'
        WHEN 'incode_add_back' then 'doc_scan'
        WHEN 'incode_process_id' then 'doc_scan'
        WHEN 'incode_fetch_scores' then 'doc_scan'
        WHEN 'incode_add_privacy_consent' then 'doc_scan'
        WHEN 'incode_add_ml_consent' then 'doc_scan'
        WHEN 'incode_fetch_ocr' then 'doc_scan'
        WHEN 'incode_add_selfie' then 'doc_scan'
        WHEN 'incode_get_onboarding_status' then 'doc_scan'
        WHEN 'incode_process_face' then 'doc_scan'
        WHEN 'idology_scan_verify_submission' then 'doc_scan'
        WHEN 'idology_scan_verify_results' then 'doc_scan'
        WHEN 'idology_scan_onboarding' then 'doc_scan'
    END expected_di_kind
    FROM verification_request
),
-- select vreqs who's infered DI kind does not match the kind of the DI they are actually pointing to
vreqs_with_di_kind_mismatch AS (
  SELECT 
    v.id vreq_id,
  	v.expected_di_kind,
    v.timestamp vreq_timestamp,
	di.id di_id,
    di.scoped_vault_id,
    di.workflow_id
  FROM vreqs v
  INNER JOIN decision_intent di ON v.decision_intent_id = di.id
  WHERE v.expected_di_kind != di.kind
),
-- group so we create 1 new DI per (DI, expected_di_kind)
expected_decision_intents AS (
    SELECT
        expected_di_kind,
        di_id,
        scoped_vault_id,
        workflow_id,
        MIN(vreq_timestamp) min_vreq_timestamp
    FROM vreqs_with_di_kind_mismatch
    GROUP BY 1,2,3,4
),
backfilled_decision_intents AS (
    INSERT INTO decision_intent(created_at, kind, scoped_vault_id, workflow_id, from_decision_intent_id)
    SELECT min_vreq_timestamp, expected_di_kind, scoped_vault_id, workflow_id, di_id FROM expected_decision_intents
    RETURNING id, from_decision_intent_id, kind
)

-- join new DI's back to vreqs and update vreq.decision_intent_id
UPDATE verification_request vreq
SET decision_intent_id = b.id
FROM backfilled_decision_intents b 
INNER JOIN vreqs_with_di_kind_mismatch v 
    ON v.di_id = b.from_decision_intent_id AND v.expected_di_kind = b.kind
WHERE vreq.id = v.vreq_id;

ALTER TABLE decision_intent DROP COLUMN from_decision_intent_id; 
