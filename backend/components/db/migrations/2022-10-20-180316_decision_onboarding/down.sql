ALTER TABLE onboarding ADD COLUMN latest_decision_id TEXT;
ALTER TABLE onboarding 
    ADD CONSTRAINT fk_onboarding_latest_decision_id
        FOREIGN KEY(latest_decision_id) 
        REFERENCES onboarding_decision(id);

CREATE INDEX IF NOT EXISTS onboarding_latest_decision_id_index ON onboarding(latest_decision_id);

ALTER TABLE onboarding_decision DROP COLUMN deactivated_at;