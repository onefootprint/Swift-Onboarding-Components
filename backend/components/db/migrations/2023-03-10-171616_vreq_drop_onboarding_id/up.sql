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
    JOIN verification_request vr on vr.scoped_user_id = o.scoped_user_id
    LEFT JOIN verification_result vres on vres.request_id = vr.id
);

ALTER TABLE verification_request 
    DROP CONSTRAINT fk_verification_request_onboarding_id, 
    DROP COLUMN onboarding_id;