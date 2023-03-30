ALTER TABLE user_vault RENAME TO vault;
ALTER TABLE scoped_user RENAME TO scoped_vault;
ALTER TABLE user_vault_data RENAME TO vault_data;

ALTER TABLE vault_data ALTER COLUMN id SET DEFAULT prefixed_uid('vd_');

ALTER TABLE data_lifetime RENAME COLUMN user_vault_id TO vault_id;
ALTER TABLE scoped_vault RENAME COLUMN user_vault_id TO vault_id;
ALTER TABLE webauthn_credential RENAME COLUMN user_vault_id TO vault_id;
ALTER TABLE user_timeline RENAME COLUMN user_vault_id TO vault_id;
ALTER TABLE fingerprint_visit_event RENAME COLUMN user_vault_id TO vault_id;

ALTER TABLE data_lifetime RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE access_event RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE verification_request RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE document_request RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE user_timeline RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE liveness_event RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE annotation RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE onboarding RENAME COLUMN scoped_user_id TO scoped_vault_id;
ALTER TABLE fingerprint_visit_event RENAME COLUMN scoped_user_id TO scoped_vault_id;