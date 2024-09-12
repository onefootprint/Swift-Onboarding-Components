WITH creds_per_sv AS (
    SELECT 
        wc.id as origin_id,
        wc.vault_id,
        wc.credential_id,
        wc.public_key,
        wc.attestation_data,
        wc.backup_eligible,
        wc.attestation_type,
        wc.insight_event_id,
        wc.backup_state,
        wc.deactivated_at,
        scoped_vault.id as scoped_vault_id
    FROM webauthn_credential wc
    -- Join on every scoped_vault that existed at the time the credential was registered
    INNER JOIN scoped_vault
        ON scoped_vault.vault_id = wc.vault_id AND scoped_vault.start_timestamp <= wc._created_at AND scoped_vault.id != wc.scoped_vault_id
    WHERE wc.deactivated_at IS NULL
),
creds_to_create AS (
    SELECT 
        vault_id,
        credential_id,
        public_key,
        attestation_data,
        backup_eligible,
        attestation_type,
        insight_event_id,
        backup_state,
        deactivated_at,
        scoped_vault_id,
        origin_id
    FROM creds_per_sv wc
    -- Don't create if scoped vault already has an active webauthn_credential
    WHERE NOT EXISTS (
        SELECT 1 FROM webauthn_credential
        WHERE
            scoped_vault_id = wc.scoped_vault_id AND
            deactivated_at IS NULL
    )
    LIMIT 2000
)
INSERT INTO webauthn_credential(
    vault_id,
    credential_id,
    public_key,
    attestation_data,
    backup_eligible,
    attestation_type,
    insight_event_id,
    backup_state,
    deactivated_at,
    scoped_vault_id,
    origin_id
)
SELECT * FROM creds_to_create;
