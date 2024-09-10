-- Run this manually in dev/prod.
UPDATE
	scoped_vault_version svv
SET
	tenant_id = scoped_vault.tenant_id,
	is_live = scoped_vault.is_live
FROM
	scoped_vault
WHERE
	scoped_vault.id = svv.scoped_vault_id;
