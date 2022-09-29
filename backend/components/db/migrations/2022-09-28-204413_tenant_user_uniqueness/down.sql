DROP INDEX tenant_user_unique_tenant_email;
ALTER TABLE tenant_user ADD CONSTRAINT tenant_user_unique_tenant_email UNIQUE(email, tenant_id);