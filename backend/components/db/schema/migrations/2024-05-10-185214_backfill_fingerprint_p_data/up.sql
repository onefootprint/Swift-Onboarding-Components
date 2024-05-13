-- TODO run before merging
WITH rows_to_insert AS (
    SELECT vault_data.p_data, data_lifetime.id as lifetime_id, data_lifetime.kind, data_lifetime.scoped_vault_id, scoped_vault.vault_id, scoped_vault.tenant_id, scoped_vault.is_live, data_lifetime.deactivated_at
    FROM vault_data
    -- Don't make duplicate fingerprints
    LEFT JOIN fingerprint ON vault_data.lifetime_id = fingerprint.lifetime_id AND fingerprint.p_data IS NOT NULL
    INNER JOIN data_lifetime on vault_data.lifetime_id = data_lifetime.id
    INNER JOIN scoped_vault on data_lifetime.scoped_vault_id = scoped_vault.id
    WHERE fingerprint.id IS NULL AND data_lifetime.kind = 'business.name' AND vault_data.p_data IS NOT NULL
    LIMIT 5000
)
INSERT INTO fingerprint (p_data, kind, lifetime_id, version, scope, is_hidden, scoped_vault_id, vault_id, tenant_id, is_live, deactivated_at)
(
    SELECT p_data, kind, lifetime_id, 'v2', 'plaintext', 'f', scoped_vault_id, vault_id, tenant_id, is_live, deactivated_at
    FROM rows_to_insert
);