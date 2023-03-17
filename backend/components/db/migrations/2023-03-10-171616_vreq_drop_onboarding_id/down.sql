ALTER TABLE verification_request 
    ADD COLUMN onboarding_id TEXT,
        
    ADD CONSTRAINT fk_verification_request_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED;
    
CREATE INDEX IF NOT EXISTS verification_request_onboarding_id ON verification_request(onboarding_id);

DROP VIEW vendor_calls_view;

CREATE VIEW vendor_calls_view as (
    SELECT 
        su.id as scoped_user_id,
        su.fp_user_id,
        t.name as tenant_name,
        o.id as onboarding_id,
        vr.vendor_api,
        vr.id as verification_request_id,
        vres.id as verification_result_id,
        vres.response as scrubbed_response
    FROM scoped_user su 
    JOIN onboarding o on o.scoped_user_id = su.id
    JOIN tenant t on t.id = su.tenant_id
    JOIN verification_request vr on vr.onboarding_id = o.id
    LEFT JOIN verification_result vres on vres.request_id = vr.id
);
