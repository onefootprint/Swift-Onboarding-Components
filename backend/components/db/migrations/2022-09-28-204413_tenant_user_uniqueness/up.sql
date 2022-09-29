ALTER TABLE tenant_user DROP CONSTRAINT tenant_user_unique_tenant_email;
CREATE UNIQUE INDEX tenant_user_unique_tenant_email ON tenant_user(email, tenant_id) WHERE deactivated_at IS NULL;