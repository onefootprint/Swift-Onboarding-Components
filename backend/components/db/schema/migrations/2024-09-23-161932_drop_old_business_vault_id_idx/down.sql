-- This was incorrect
CREATE INDEX CONCURRENTLY IF NOT EXISTS business_owner_business_vault_id ON business_owner(user_vault_id);