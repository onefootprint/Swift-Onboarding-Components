SELECT
  CASE
    WHEN data_lifetime.kind ilike 'card.%.%' THEN REGEXP_REPLACE(data_lifetime.kind, 'card\.(.*)\.(.*)', 'card.*.\2')
    WHEN data_lifetime.kind ilike 'custom.%' THEN 'custom.*'
    ELSE data_lifetime.kind
  END,
  COUNT(DISTINCT data_lifetime.vault_id)
FROM data_lifetime
INNER JOIN scoped_vault
  ON scoped_vault.id = data_lifetime.scoped_vault_id
INNER JOIN tenant
  ON tenant.id = scoped_vault.tenant_id
WHERE
  deactivated_seqno IS NULL AND
  scoped_vault.is_live AND
  tenant.sandbox_restricted = 'f' AND
  tenant.id not like '_private_it_org_%'
GROUP BY 1
ORDER BY 2 DESC, 1 ASC;