
CREATE TABLE requirement (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('req_'),
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    initiator TEXT NOT NULL,
    user_vault_id TEXT NOT NULL,
    fulfilled_at TIMESTAMPTZ,
    fulfilled_by_requirement_id TEXT,
    onboarding_id UUID,
    created_at TIMESTAMPTZ NOT NULL,
    deactivated_at TIMESTAMPTZ,
    error_message TEXT,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_fulfilled_by_requirement_id
        FOREIGN KEY(fulfilled_by_requirement_id) 
        REFERENCES requirement(id),

    CONSTRAINT fk_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vault(id),

    CONSTRAINT fk_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id)
);

CREATE INDEX IF NOT EXISTS requirement_user_vault_id_index ON requirement(user_vault_id);
CREATE INDEX IF NOT EXISTS requirement_onboarding_id_index ON requirement(onboarding_id);
CREATE INDEX IF NOT EXISTS requirement_fulfilled_by_requirement_id_index ON requirement(fulfilled_by_requirement_id);

SELECT diesel_manage_updated_at('requirement');