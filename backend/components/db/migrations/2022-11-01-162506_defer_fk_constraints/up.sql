-- from: 
-- select constraint_name, table_name from information_schema.table_constraints where constraint_name like 'fk_%';
-- 
-- and this was checked with:
-- 
-- select constraint_name like 'fk_%' is_fk_prefixed, count(*)  from information_schema.table_constraints where constraint_type='FOREIGN KEY' GROUP BY 1;
-- 
--  is_fk_prefixed | count
-- ----------------+-------
--  t              |    46
-- (1 row)

ALTER TABLE tenant_api_key ALTER CONSTRAINT fk_tenant_api_keys_tenant_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE ob_configuration ALTER CONSTRAINT fk_ob_configurations_tenant_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE scoped_user ALTER CONSTRAINT fk_scoped_users_tenant_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE scoped_user ALTER CONSTRAINT fk_scoped_users_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE webauthn_credential ALTER CONSTRAINT fk_webauthn_credentials_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE webauthn_credential ALTER CONSTRAINT fk_webauthn_credentials_insight_event_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE access_event ALTER CONSTRAINT fk_access_events_scoped_user_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE access_event ALTER CONSTRAINT fk_access_events_insight_event_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE verification_request ALTER CONSTRAINT fk_verification_request_email_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE verification_request ALTER CONSTRAINT fk_verification_request_phone_number_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE verification_request ALTER CONSTRAINT fk_verification_request_identity_data_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE verification_request ALTER CONSTRAINT fk_identity_document_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE verification_request ALTER CONSTRAINT fk_verification_request_onboarding_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE verification_result ALTER CONSTRAINT fk_verification_results_request_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE audit_trail ALTER CONSTRAINT fk_audit_trails_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE audit_trail ALTER CONSTRAINT fk_audit_trails_tenant_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE audit_trail ALTER CONSTRAINT fk_audit_trail_verifiction_result_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE tenant_api_key_access_log ALTER CONSTRAINT fk_tenant_api_key_access_logs_tenant_api_key_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE fingerprint ALTER CONSTRAINT fk_fingerprint_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE phone_number ALTER CONSTRAINT fk_phone_number_user_valt_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE email ALTER CONSTRAINT fk_email_user_valt_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE identity_data ALTER CONSTRAINT fk_id_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE kv_data ALTER CONSTRAINT fk_kv_data_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE kv_data ALTER CONSTRAINT fk_kv_data_tenant_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE tenant_user ALTER CONSTRAINT fk_tenant_user_tenant_role_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE tenant_user ALTER CONSTRAINT fk_tenant_user_tenant_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE tenant_role ALTER CONSTRAINT fk_tenant_role_tenant_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE document_request ALTER CONSTRAINT fk_document_request_onboarding_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE identity_document ALTER CONSTRAINT fk_identity_document_onboarding_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE identity_document ALTER CONSTRAINT fk_identity_document_request_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE requirement ALTER CONSTRAINT fk_fulfilled_by_requirement_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE requirement ALTER CONSTRAINT fk_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE requirement ALTER CONSTRAINT fk_onboarding_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE requirement_verification_request_junction ALTER CONSTRAINT fk_verification_request_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE requirement_verification_request_junction ALTER CONSTRAINT fk_requirement_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE onboarding_decision ALTER CONSTRAINT fk_onboarding_decision_tenant_user_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE onboarding_decision ALTER CONSTRAINT fk_onboarding_decision_onboarding_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE onboarding_decision_verification_result_junction ALTER CONSTRAINT fk_onboarding_decision_verification_result_junction_onboarding_ DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE onboarding_decision_verification_result_junction ALTER CONSTRAINT fk_onboarding_decision_verification_result_junction_verificatio DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE onboarding ALTER CONSTRAINT fk_onboardings_insight_event_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE onboarding ALTER CONSTRAINT fk_onboardings_scoped_user_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE onboarding ALTER CONSTRAINT fk_onboardings_ob_configuration_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE risk_signal ALTER CONSTRAINT fk_risk_signal_onboarding_decision_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE user_timeline ALTER CONSTRAINT fk_user_timeline_onboarding_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE user_timeline ALTER CONSTRAINT fk_user_timeline_user_vault_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE user_timeline ALTER CONSTRAINT fk_user_timeline_onboarding_id DEFERRABLE INITIALLY DEFERRED;