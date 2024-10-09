-- TODO run manually before merging
UPDATE scoped_vault_tag
SET tenant_id = scoped_vault.tenant_id, is_live = scoped_vault.is_live
FROM scoped_vault
WHERE
    scoped_vault_tag.scoped_vault_id = scoped_vault.id
    AND scoped_vault_tag.tenant_id IS NULL
    AND scoped_vault_tag.is_live IS NULL;


UPDATE scoped_vault_label
SET tenant_id = scoped_vault.tenant_id, is_live = scoped_vault.is_live
FROM scoped_vault
WHERE
    scoped_vault_label.scoped_vault_id = scoped_vault.id
    AND scoped_vault_label.tenant_id IS NULL
    AND scoped_vault_label.is_live IS NULL;
