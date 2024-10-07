-- TODO run manually before merging
UPDATE manual_review
SET tenant_id = scoped_vault.tenant_id, is_live = scoped_vault.is_live
FROM scoped_vault
WHERE
    manual_review.scoped_vault_id = scoped_vault.id
    AND manual_review.tenant_id IS NULL
    AND manual_review.is_live IS NULL;
