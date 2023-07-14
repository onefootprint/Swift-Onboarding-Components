ALTER TABLE risk_signal_group ADD COLUMN verification_result_id TEXT;

WITH new_risk_signal_group_data AS (
    SELECT
        rs.verification_result_id vres_id,
        vreq.scoped_vault_id sv_id,
        CASE  
            WHEN rs.vendor_api = 'incode_watchlist_check' and rs.reason_code = 'adverse_media_hit' then 'adverse_media'
            WHEN rs.vendor_api = 'incode_watchlist_check' then 'watchlist'
            WHEN rs.vendor_api = 'idology_expect_id' then 'kyc'
            WHEN rs.vendor_api = 'socure_id_plus' then 'kyc'
            WHEN rs.vendor_api = 'middesk_business_update_webhook' then 'kyb'
            WHEN rs.vendor_api = 'experian_precise_id' THEN 'kyc'
        END kind,
        MAX(rs.created_at) created_at
    FROM risk_signal rs
    INNER JOIN verification_result vres on rs.verification_result_id = vres.id
    INNER JOIN verification_request vreq on vres.request_id = vreq.id
    WHERE rs.risk_signal_group_id IS NULL
    GROUP BY 1,2,3
),
backfilled_risk_signal_groups AS (
    INSERT INTO risk_signal_group(verification_result_id, scoped_vault_id, kind, created_at)
    SELECT vres_id, sv_id, kind, created_at FROM new_risk_signal_group_data
    RETURNING id, created_at, kind, verification_result_id
)

UPDATE risk_signal rs
SET risk_signal_group_id = b.id
FROM backfilled_risk_signal_groups b
WHERE rs.verification_result_id = b.verification_result_id
    AND (
            (rs.vendor_api = 'incode_watchlist_check' AND rs.reason_code = 'adverse_media_hit' AND b.kind = 'adverse_media')
            OR (rs.vendor_api = 'incode_watchlist_check' AND rs.reason_code != 'adverse_media_hit' AND b.kind = 'watchlist')
            OR (rs.vendor_api != 'incode_watchlist_check')
    );

COMMIT;
BEGIN;
ALTER TABLE risk_signal_group DROP COLUMN verification_result_id;
