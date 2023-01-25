-- Tenant user is now unique per email
CREATE UNIQUE INDEX tenant_user_unique_email ON tenant_user(LOWER(email));