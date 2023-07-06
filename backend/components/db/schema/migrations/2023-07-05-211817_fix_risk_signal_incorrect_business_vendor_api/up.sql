WITH updates as (
    SELECT
        rs.id
    FROM risk_signal rs
    INNER JOIN onboarding_decision obd ON rs.onboarding_decision_id = obd.id
    INNER JOIN onboarding o ON o.id = obd.onboarding_id
    INNER JOIN scoped_vault sv ON sv.id = o.scoped_vault_id
    INNER JOIN vault v ON sv.vault_id = v.id
    WHERE 
        v.kind = 'business' and rs.vendor_api = 'idology_expect_id'
)

UPDATE risk_signal
SET vendor_api = 'middesk_business_update_webhook'
FROM updates u
WHERE risk_signal.id = u.id;