WITH sanbox_kyb_svids_missing_di AS (
  SELECT
    distinct(sv.id) scoped_vault_id
  FROM scoped_vault sv
  INNER JOIN vault v on sv.vault_id = v.id
  INNER JOIN onboarding ob on ob.scoped_vault_id = sv.id
  INNER JOIN onboarding_decision obd on obd.onboarding_id = ob.id
  INNER JOIN risk_signal rs on rs.onboarding_decision_id = obd.id
  LEFT JOIN decision_intent di on sv.id = di.scoped_vault_id
  LEFT JOIN verification_request vreq on vreq.scoped_vault_id = sv.id
  WHERE
    v.is_live = false AND v.kind = 'business' AND di.id IS NULL AND vreq.id IS NULL
),
new_dis AS (
  INSERT INTO decision_intent(created_at, kind, scoped_vault_id)
  SELECT NOW(), 'onboarding_kyb', scoped_vault_id from sanbox_kyb_svids_missing_di
  RETURNING *
),
new_vreqs AS (
    INSERT INTO verification_request (timestamp, vendor, vendor_api, scoped_vault_id, decision_intent_id, uvw_snapshot_seqno)
    SELECT NOW(), 'middesk', 'middesk_business_update_webhook', scoped_vault_id, id, (SELECT last_value FROM data_lifetime_seqno) FROM new_dis
    RETURNING *
)
INSERT INTO verification_result (timestamp, request_id, response, is_error)
SELECT NOW(), id, '{}', false FROM new_vreqs;
