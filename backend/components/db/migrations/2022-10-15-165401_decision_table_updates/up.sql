-- Create onboarding_decision_table
CREATE TABLE onboarding_decision (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('decision_'),
        
    onboarding_id uuid NOT NULL,

    logic_git_hash TEXT NOT NULL,

    -- indicates that an admin user that made the decision
    tenant_user_id TEXT,

    verification_status TEXT NOT NULL,
    compliance_status TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,

    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id),

    CONSTRAINT fk_tenant_user_id
        FOREIGN KEY(tenant_user_id) 
        REFERENCES tenant_user(id)
);

CREATE INDEX IF NOT EXISTS onboarding_decision_onboarding_id_index ON onboarding_decision(onboarding_id);
CREATE INDEX IF NOT EXISTS onboarding_decision_tenant_user_id_index ON onboarding_decision(tenant_user_id);
SELECT diesel_manage_updated_at('onboarding_decision');

-- Junction table to link verification results to a decision
CREATE TABLE onboarding_decision_verification_result_junction(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_result_id uuid NOT NULL,
    onboarding_decision_id TEXT NOT NULL,

    CONSTRAINT fk_verification_result_id
        FOREIGN KEY(verification_result_id) 
        REFERENCES verification_result(id),

    CONSTRAINT fk_decision_id
        FOREIGN KEY(onboarding_decision_id) 
        REFERENCES onboarding_decision(id)
);

CREATE INDEX IF NOT EXISTS junction_verification_result_id_index ON onboarding_decision_verification_result_junction(verification_result_id);
CREATE INDEX IF NOT EXISTS junction_onboarding_decision_id_index ON onboarding_decision_verification_result_junction(onboarding_decision_id);

-- Update onboarding table
ALTER TABLE onboarding RENAME kyc_status TO status;
ALTER TABLE onboarding ADD COLUMN latest_decision_id TEXT;

ALTER TABLE onboarding 
    ADD CONSTRAINT fk_onboarding_latest_decision_id
        FOREIGN KEY(latest_decision_id) 
        REFERENCES onboarding_decision(id);

CREATE INDEX IF NOT EXISTS onboarding_latest_decision_id_index ON onboarding(latest_decision_id);

-- Create risk_signal table
CREATE TABLE risk_signal (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('sig_'),

    scope TEXT[] NOT NULL,

    onboarding_decision_id TEXT NOT NULL,

    reason_code TEXT NOT NULL,
    description TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    deactivated_at TIMESTAMPTZ,

    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_onboarding_decision
        FOREIGN KEY(onboarding_decision_id) 
        REFERENCES onboarding_decision(id)
);

CREATE INDEX IF NOT EXISTS risk_decision_id_index ON risk_signal(onboarding_decision_id);

SELECT diesel_manage_updated_at('risk_signal');