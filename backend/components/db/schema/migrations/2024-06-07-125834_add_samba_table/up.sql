CREATE TABLE samba_order (
    id text PRIMARY KEY DEFAULT prefixed_uid('smbao_'),
    -- not wf_id since I forsee us maybe doing this adhoc from the dash
    decision_intent_id TEXT NOT NULL,
    -- what identity document did we send this for (since we don't track LifetimeId<>IdentityDocumentId)
    document_id TEXT,
    -- license validation or activity_history, could be multiple samba_orders per session
    kind TEXT NOT NULL,
    created_at timestamptz NOT NULL,
    -- keep track of what data was in vault when we sent
    created_seqno BIGINT NOT NULL,
    -- order is complete when we have a report
    completed_at timestamptz,
    -- keep track of the order id and what we sent
    order_id TEXT NOT NULL,
    verification_result_id TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
     CONSTRAINT fk_samba_verification_decision_intent_id
        FOREIGN KEY(decision_intent_id) 
        REFERENCES decision_intent(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_samba_verification_identity_document_id
        FOREIGN KEY(document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_samba_order_verification_result_id
        FOREIGN KEY(verification_result_id) 
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED
);
SELECT diesel_manage_updated_at('samba_order');
CREATE INDEX IF NOT EXISTS samba_order_verification_result_id ON samba_order(verification_result_id);
CREATE INDEX IF NOT EXISTS samba_order_decision_intent_id ON samba_order(decision_intent_id);
CREATE INDEX IF NOT EXISTS samba_order_identity_document_id ON samba_order(document_id);

-- specifically which records in the vault did we send, for audit/context history
CREATE TABLE samba_order_data_lifetime_junction  (
    id text PRIMARY KEY DEFAULT prefixed_uid('smbal_'),
    lifetime_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_samba_order_data_lifetime_junction_lifetime_id
        FOREIGN KEY(lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_samba_order_data_lifetime_junction_order_id
        FOREIGN KEY(order_id) 
        REFERENCES samba_order(id)
        DEFERRABLE INITIALLY DEFERRED
);
SELECT diesel_manage_updated_at('samba_order_data_lifetime_junction');
CREATE INDEX IF NOT EXISTS samba_order_data_lifetime_junction_lifetime_id ON samba_order_data_lifetime_junction(lifetime_id);
CREATE INDEX IF NOT EXISTS samba_order_data_lifetime_junction_order_id ON samba_order_data_lifetime_junction(order_id);


CREATE TABLE samba_report (
    id text PRIMARY KEY DEFAULT prefixed_uid('smbar_'),
    created_at timestamptz NOT NULL,
    order_id TEXT NOT NULL,
     -- stash the report id
    report_id TEXT NOT NULL,
    -- where the final result lives
    verification_result_id TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_samba_report_order_id
        FOREIGN KEY(order_id) 
        REFERENCES samba_order(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_samba_report_verification_result_id
        FOREIGN KEY(verification_result_id) 
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED
);
SELECT diesel_manage_updated_at('samba_report');
CREATE INDEX IF NOT EXISTS samba_report_order_id ON samba_report(order_id);
CREATE INDEX IF NOT EXISTS samba_report_report_id ON samba_report(report_id);
CREATE INDEX IF NOT EXISTS samba_report_verification_result_id ON samba_report(verification_result_id);
   
