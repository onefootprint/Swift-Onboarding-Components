ALTER TABLE tenant_role
    ADD COLUMN is_live BOOLEAN,
    -- Add constraint that is_live is set when the role is for API keys
    ADD CONSTRAINT is_live_for_api_key_roles
        CHECK((is_live IS NOT NULL) OR (kind != 'api_key'));
