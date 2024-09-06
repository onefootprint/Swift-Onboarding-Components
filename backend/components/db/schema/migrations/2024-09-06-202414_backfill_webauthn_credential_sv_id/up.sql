-- We didn't store the scoped_vault_id anywhere when the webauthn credentials were registered...
-- So now we need to piece together which of the user's scoped_vaults created the webauthn credential.


-- First, backfill passkeys that only had one scoped vault existing at the time the passkey was registered
WITH cred_to_sv_id AS (
    SELECT 
        webauthn_credential.id, scoped_vault.id as scoped_vault_id
    FROM webauthn_credential
    INNER JOIN scoped_vault
        ON webauthn_credential.vault_id = scoped_vault.vault_id AND
        -- Only scoped vaults that existed when the webauthn credential was registered
        webauthn_credential._created_at > scoped_vault.start_timestamp
),
creds_with_multiple_svs AS (
    SELECT id
    FROM cred_to_sv_id
    GROUP BY 1
    HAVING COUNT(*) > 1
),
-- Only update the creds that had one SV existing at the time they were registered
creds_to_update AS (
    SELECT id, scoped_vault_id 
    FROM cred_to_sv_id
    WHERE id NOT IN (SELECT id FROM creds_with_multiple_svs) AND id IN (SELECT id from webauthn_credential WHERE scoped_vault_id IS NULL)
)
UPDATE webauthn_credential
SET scoped_vault_id = creds_to_update.scoped_vault_id
FROM creds_to_update
WHERE webauthn_credential.id = creds_to_update.id;


-- Then, backfill remaining passkeys that had multiple SVs at the time the passkey was registered
WITH cred_to_sv_id AS (
    SELECT 
        webauthn_credential.id, scoped_vault.id as scoped_vault_id
    FROM webauthn_credential
    INNER JOIN scoped_vault
        ON webauthn_credential.vault_id = scoped_vault.vault_id AND
        -- Only scoped vaults that existed when the webauthn credential was registered
        webauthn_credential._created_at > scoped_vault.start_timestamp
    WHERE scoped_vault_id IS NULL
),
creds_with_multiple_svs AS (
    SELECT id
    FROM cred_to_sv_id
    GROUP BY 1
    HAVING COUNT(*) > 1
),
pre_creds_to_update AS (
    SELECT 
        id, scoped_vault_id
    FROM cred_to_sv_id
    -- Modern passkey registrations also have timeline events. Look for the scoped vault that has the passkey registration timeline event
    WHERE EXISTS (
        SELECT 1 
        FROM user_timeline
        WHERE user_timeline.scoped_vault_id = cred_to_sv_id.scoped_vault_id AND event_kind = 'auth_method_updated' AND event->'data'->>'kind' = 'passkey'
    ) AND
    id IN (SELECT id FROM creds_with_multiple_svs)
    AND id IN (SELECT id from webauthn_credential WHERE scoped_vault_id IS NULL)
),
-- Some of these even have duplicates somehow, so let's filter those out
creds_with_multiple_svs2 AS (
    SELECT id
    FROM pre_creds_to_update
    GROUP BY 1
    HAVING count(*) > 1
),
creds_to_update AS (
    SELECT id, scoped_vault_id
    FROM pre_creds_to_update
    WHERE id NOT IN (select id from creds_with_multiple_svs2)
)
UPDATE webauthn_credential
SET scoped_vault_id = creds_to_update.scoped_vault_id
FROM creds_to_update
WHERE webauthn_credential.id = creds_to_update.id;


-- Then, there will be a few leftovers (seems like 5 in prod) that I'll need to backfill manually