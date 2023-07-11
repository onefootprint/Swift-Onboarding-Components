ALTER TABLE tenant_role DROP COLUMN scopes;
ALTER TABLE tenant_role RENAME COLUMN scopes_old TO scopes;
ALTER TABLE tenant_role ALTER COLUMN scopes SET NOT NULL;