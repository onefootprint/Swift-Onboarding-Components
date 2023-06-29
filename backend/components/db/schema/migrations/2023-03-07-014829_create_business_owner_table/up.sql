CREATE TABLE business_owner (
    id text PRIMARY KEY DEFAULT prefixed_uid('bo_'),
    user_vault_id TEXT NOT NULL,
    business_vault_id TEXT NOT NULL,
    CONSTRAINT fk_business_owner_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_business_owner_business_vault_id
        FOREIGN KEY(business_vault_id) 
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED
    -- TODO would be cool to add a check constraint that business_vault_id and user_vault_id have a specific prefix
);

CREATE INDEX IF NOT EXISTS business_owner_user_vault_id ON business_owner(user_vault_id);
CREATE INDEX IF NOT EXISTS business_owner_business_vault_id ON business_owner(user_vault_id);

SELECT diesel_manage_updated_at('business_owner');