CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS business_owner_unique_bv_id_link_id ON business_owner (business_vault_id, link_id);
