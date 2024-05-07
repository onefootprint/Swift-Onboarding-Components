SELECT
  scoped_vault.tenant_id,
  tenant.name,
  scoped_vault.is_live,
  scoped_vault.fp_id,
  scoped_vault.id AS scoped_vault_id,
  data_lifetime.kind as data_identifier,
  MAX(data_lifetime.created_seqno) as created_seqno
FROM scoped_vault
  INNER JOIN data_lifetime ON scoped_vault.id = data_lifetime.scoped_vault_id
  INNER JOIN tenant ON scoped_vault.tenant_id = tenant.id
WHERE
  data_lifetime.created_at > '2024-05-03 00:00:00.000000+00'
  AND data_lifetime.created_at < '2024-05-07 06:00:00.000000+00'
  AND data_lifetime.kind LIKE '%expiration'
GROUP BY
  scoped_vault.tenant_id,
  tenant.name,
  scoped_vault.is_live,
  scoped_vault.fp_id,
  scoped_vault.id,
  data_lifetime.kind
ORDER BY
  scoped_vault.tenant_id,
  scoped_vault.is_live;
