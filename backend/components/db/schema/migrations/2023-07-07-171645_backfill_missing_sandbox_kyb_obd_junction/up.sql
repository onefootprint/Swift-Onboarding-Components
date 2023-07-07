WITH sandbox_kyb_obds AS (
  SELECT 
	sv.id sv_id, ob.id ob_id, obd.id obd_id
	FROM scoped_vault sv 
    INNER JOIN vault v ON sv.vault_id = v.id
    INNER JOIN onboarding ob ON ob.scoped_vault_id = sv.id
    INNER JOIN onboarding_decision obd ON obd.onboarding_id = ob.id
    WHERE v.is_live = false AND v.kind = 'business' AND obd.actor->>'kind' = 'footprint'
),
sandbox_kyb_obds_missing_junc AS (
  SELECT 
    obd.obd_id, obd.sv_id 
  FROM sandbox_kyb_obds obd
  LEFT JOIN onboarding_decision_verification_result_junction junc ON junc.onboarding_decision_id = obd.obd_id
  WHERE junc.id IS NULL
),
dangling_vres as ( 
    SELECT 
        vres.id vres_id, s.obd_id
    FROM sandbox_kyb_obds_missing_junc s
    INNER JOIN verification_request vreq on vreq.scoped_vault_id = s.sv_id
    INNER JOIN verification_result vres on vreq.id = vres.request_id
    WHERE vreq.vendor_api = 'middesk_business_update_webhook'
)

INSERT INTO onboarding_decision_verification_result_junction (verification_result_id, onboarding_decision_id)
SELECT vres_id, obd_id FROM dangling_vres;
