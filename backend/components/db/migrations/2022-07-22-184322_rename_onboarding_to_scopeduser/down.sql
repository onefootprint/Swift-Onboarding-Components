ALTER TABLE scoped_users RENAME TO onboardings;

-- Change default for prefix of new scoped_users
ALTER TABLE onboardings ALTER COLUMN id SET DEFAULT prefixed_uid('ob_');

-- Rename indexes on onboardings table
ALTER INDEX scoped_users_pkey RENAME TO onboardings_pkey;
ALTER INDEX scoped_users_fp_id RENAME TO onboardings_fp_id;
ALTER INDEX scoped_users_insight_event_id RENAME TO onboardings_insight_event_id;
ALTER INDEX scoped_users_tenant_id RENAME TO onboardings_tenant_id;
ALTER INDEX scoped_users_unique_user_vault_id_tenant_id RENAME TO onboardings_unique_user_vault_id_tenant_id;
ALTER INDEX scoped_users_user_ob_id_key RENAME TO onboardings_user_ob_id_key;
ALTER INDEX scoped_users_user_vault_id RENAME TO onboardings_user_vault_id;

-- Rename foriegn key constraints on onboardings table
ALTER TABLE onboardings RENAME CONSTRAINT fk_scoped_users_tenant_id TO fk_onboardings_tenant_id;
ALTER TABLE onboardings RENAME CONSTRAINT fk_scoped_users_user_vault_id TO fk_onboardings_user_vault_id;
ALTER TABLE onboardings RENAME CONSTRAINT fk_scoped_users_insight_event_id TO fk_onboardings_insight_event_id;

-- Rename user_ob_id to more logical fp_user_id
ALTER TABLE onboardings RENAME COLUMN fp_user_id TO user_ob_id;

-- Rename onboarding_id foreign keys on other tables that reference this table
ALTER TABLE access_events RENAME COLUMN scoped_user_id TO onboarding_id;
ALTER TABLE access_events RENAME CONSTRAINT fk_access_events_scoped_user_id TO fk_access_events_onboarding_id;

ALTER TABLE onboarding_links RENAME COLUMN scoped_user_id TO onboarding_id;
ALTER TABLE onboarding_links RENAME CONSTRAINT fk_onboarding_links_scoped_user_id TO fk_onboarding_links_onboarding_id;

ALTER TABLE verification_requests RENAME COLUMN scoped_user_id TO onboarding_id;
ALTER TABLE verification_requests RENAME CONSTRAINT fk_verification_requests_scoped_user_id TO fk_verification_requests_onboarding_id;