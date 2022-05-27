DROP TABLE IF EXISTS sessions;
DROP INDEX IF EXISTS onboardings_fp_id;
DROP INDEX IF EXISTS onboardings_tenant_id;
DROP TABLE IF EXISTS onboardings;
DROP FUNCTION IF EXISTS expire_sessions;
DROP TABLE IF EXISTS tenants;
DROP INDEX IF EXISTS tenants_workos_id;
DROP INDEX IF EXISTS user_data_unique_kind_fingerprint;
DROP INDEX IF EXISTS user_data_unique_primary_data;
DROP INDEX IF EXISTS user_data_user_vault_id_data_kind;
DROP INDEX IF EXISTS user_data_fingerprint;
DROP TABLE IF EXISTS user_data;
DROP INDEX IF EXISTS user_vaults_sh_ssn;
DROP INDEX IF EXISTS user_vaults_sh_phone_number;
DROP INDEX IF EXISTS user_vaults_sh_email;
DROP TABLE IF EXISTS user_vaults;
DROP TABLE IF EXISTS tenant_api_keys;
DROP TYPE IF EXISTS User_Status;
DROP TYPE IF EXISTS data_kind;
DROP TYPE IF EXISTS data_priority;
DROP FUNCTION IF EXISTS prefixed_uid;