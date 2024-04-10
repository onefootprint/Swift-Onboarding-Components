-- These will take a table lock but should be instantaneous because of the check constraints
ALTER TABLE fingerprint
    ALTER COLUMN scoped_vault_id SET NOT NULL,
    ALTER COLUMN vault_id SET NOT NULL,
    ALTER COLUMN tenant_id SET NOT NULL,
    ALTER COLUMN is_live SET NOT NULL;