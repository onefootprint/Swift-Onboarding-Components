WITH to_deactivate AS (
    SELECT 
        wc1.id, wc1.scoped_vault_id, wc2._created_at as deactivated_at
    FROM webauthn_credential wc1
    INNER JOIN webauthn_credential wc2
        on wc1.scoped_vault_id = wc2.scoped_vault_id and wc1._created_at < wc2._created_at
    WHERE wc1.deactivated_at IS NULL AND wc2.deactivated_at IS NULL
)
UPDATE webauthn_credential
SET deactivated_at = to_deactivate.deactivated_at
FROM to_deactivate
WHERE webauthn_credential.id = to_deactivate.id;