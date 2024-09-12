WITH to_delete AS (
    SELECT wc2.id
    FROM webauthn_credential wc1
    INNER JOIN webauthn_credential wc2
        on wc1.vault_id = wc2.vault_id and wc1.scoped_vault_id != wc2.scoped_vault_id and wc1.public_key = wc2.public_key and wc1.credential_id = wc2.credential_id and wc1._created_at < wc2._created_at
    WHERE NOT EXISTS (
        SELECT 1 FROM auth_event where webauthn_credential_id = wc2.id
    )
)
DELETE FROM webauthn_credential WHERE id IN (select id FROM to_delete);