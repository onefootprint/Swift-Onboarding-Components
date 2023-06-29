CREATE TABLE middesk_request (
    id text PRIMARY KEY DEFAULT prefixed_uid('midreq_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL,
    onboarding_id TEXT NOT NULL,
    decision_intent_id TEXT NOT NULL,
    business_id TEXT,
    state TEXT NOT NULL,
    completed_at TIMESTAMPTZ,

    CONSTRAINT fk_middesk_request_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_middesk_request_decision_intent_id
        FOREIGN KEY(decision_intent_id) 
        REFERENCES decision_intent(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('middesk_request');
CREATE INDEX IF NOT EXISTS middesk_request_onboarding_id ON middesk_request(onboarding_id);
CREATE INDEX IF NOT EXISTS middesk_request_decision_intent_id ON middesk_request(decision_intent_id);