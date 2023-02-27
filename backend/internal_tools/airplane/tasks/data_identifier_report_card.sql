SELECT kind, COUNT(DISTINCT data_lifetime.user_vault_id)
FROM data_lifetime
INNER JOIN scoped_user
  ON scoped_user.id = data_lifetime.scoped_user_id
INNER JOIN tenant
  ON tenant.id = scoped_user.tenant_id
WHERE
  deactivated_seqno IS NULL AND
  scoped_user.is_live AND
  tenant.sandbox_restricted = 'f' AND
  tenant.id not like '_private_it_org_%'
GROUP BY 1
ORDER BY 2 DESC, 1 ASC;