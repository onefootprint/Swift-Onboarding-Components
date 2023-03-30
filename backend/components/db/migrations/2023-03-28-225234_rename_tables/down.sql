ALTER TABLE vault RENAME TO user_vault;
ALTER TABLE scoped_vault RENAME TO scoped_user;
ALTER TABLE vault_data RENAME TO user_vault_data;

ALTER TABLE user_vault_data ALTER COLUMN id SET DEFAULT prefixed_uid('uvd_');

ALTER TABLE data_lifetime RENAME COLUMN vault_id TO user_vault_id;
ALTER TABLE scoped_user RENAME COLUMN vault_id TO user_vault_id;
ALTER TABLE webauthn_credential RENAME COLUMN vault_id TO user_vault_id;
ALTER TABLE user_timeline RENAME COLUMN vault_id TO user_vault_id;
ALTER TABLE fingerprint_visit_event RENAME COLUMN vault_id TO user_vault_id;

ALTER TABLE data_lifetime RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE access_event RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE verification_request RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE document_request RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE user_timeline RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE liveness_event RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE annotation RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE onboarding RENAME COLUMN scoped_vault_id TO scoped_user_id;
ALTER TABLE fingerprint_visit_event RENAME COLUMN scoped_vault_id TO scoped_user_id;