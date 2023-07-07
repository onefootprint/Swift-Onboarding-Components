WITH obd_vres_junc AS (
    SELECT
        junc.onboarding_decision_id,
        junc.verification_result_id,
        vreq.vendor_api
    FROM onboarding_decision_verification_result_junction junc
    INNER JOIN verification_result vres 
        ON junc.verification_result_id = vres.id
    INNER JOIN verification_request vreq
        ON vres.request_id = vreq.id
),
risk_signal_with_latest_vres as (
    SELECT
    DISTINCT ON (rs.id)
    rs.id rs_id, 
    vres.id vres_id
    FROM risk_signal rs
    INNER JOIN onboarding_decision obd ON rs.onboarding_decision_id = obd.id
    INNER JOIN onboarding ob ON obd.onboarding_id = ob.id
    INNER JOIN scoped_vault sv ON sv.id = ob.scoped_vault_id
    INNER JOIN verification_request vreq 
    ON (vreq.scoped_vault_id = sv.id 
    AND vreq.vendor_api = rs.vendor_api AND rs.created_at > vreq.timestamp)
    INNER JOIN verification_result vres ON vreq.id = vres.request_id
    ORDER BY rs.id, vres.timestamp DESC
),
updates as (
    SELECT
        rs.id,
        coalesce(junc.verification_result_id, rswl.vres_id) verification_result_id
    FROM risk_signal rs
    LEFT JOIN obd_vres_junc junc
        ON (rs.onboarding_decision_id = junc.onboarding_decision_id
            AND rs.vendor_api = junc.vendor_api)
    LEFT JOIN risk_signal_with_latest_vres rswl ON rs.id = rswl.rs_id
    WHERE 
        rs.verification_result_id IS NULL
)

UPDATE risk_signal
SET verification_result_id = u.verification_result_id
FROM updates u
WHERE risk_signal.id = u.id;

