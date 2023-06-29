ALTER TABLE business_owner
    ADD CONSTRAINT business_owner_unique_user_business UNIQUE(user_vault_id, business_vault_id);