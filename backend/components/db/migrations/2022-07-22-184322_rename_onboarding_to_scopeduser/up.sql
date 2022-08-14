ALTER TABLE onboardings RENAME TO scoped_users;

-- Change default for prefix of new onboardings
ALTER TABLE scoped_users ALTER COLUMN id SET DEFAULT prefixed_uid('su_');

-- Rename indexes on onboardings table
ALTER INDEX onboardings_pkey RENAME TO scoped_users_pkey;
ALTER INDEX onboardings_fp_id RENAME TO scoped_users_fp_id;
ALTER INDEX onboardings_insight_event_id RENAME TO scoped_users_insight_event_id;
ALTER INDEX onboardings_tenant_id RENAME TO scoped_users_tenant_id;
ALTER INDEX onboardings_unique_user_vault_id_tenant_id RENAME TO scoped_users_unique_user_vault_id_tenant_id;
ALTER INDEX onboardings_user_ob_id_key RENAME TO scoped_users_user_ob_id_key;
ALTER INDEX onboardings_user_vault_id RENAME TO scoped_users_user_vault_id;

-- Rename foriegn key constraints on onboardings table
ALTER TABLE scoped_users RENAME CONSTRAINT fk_onboardings_tenant_id TO fk_scoped_users_tenant_id;
ALTER TABLE scoped_users RENAME CONSTRAINT fk_onboardings_user_vault_id TO fk_scoped_users_user_vault_id;
ALTER TABLE scoped_users RENAME CONSTRAINT fk_onboardings_insight_event_id TO fk_scoped_users_insight_event_id;

-- Rename user_ob_id to more logical fp_user_id
ALTER TABLE scoped_users RENAME COLUMN user_ob_id TO fp_user_id;

-- Rename onboarding_id foreign keys on other tables that reference this table
ALTER TABLE access_events RENAME COLUMN onboarding_id TO scoped_user_id;
ALTER TABLE access_events RENAME CONSTRAINT fk_access_events_onboarding_id TO fk_access_events_scoped_user_id;

ALTER TABLE onboarding_links RENAME COLUMN onboarding_id TO scoped_user_id;
ALTER TABLE onboarding_links RENAME CONSTRAINT fk_onboarding_links_onboarding_id TO fk_onboarding_links_scoped_user_id;

ALTER TABLE verification_requests RENAME COLUMN onboarding_id TO scoped_user_id;
ALTER TABLE verification_requests RENAME CONSTRAINT fk_verification_requests_onboarding_id TO fk_verification_requests_scoped_user_id;