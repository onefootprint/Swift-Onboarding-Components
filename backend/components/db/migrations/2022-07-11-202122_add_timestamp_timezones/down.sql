ALTER TABLE tenants
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE tenant_api_keys
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE insight_events
    ALTER COLUMN timestamp TYPE timestamp,
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE ob_configurations
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE user_vaults
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE onboardings
    ALTER COLUMN start_timestamp TYPE timestamp,
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE user_data
    ALTER COLUMN deactivated_at TYPE timestamp,
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE webauthn_credentials
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE access_events
    ALTER COLUMN timestamp TYPE timestamp,
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE sessions
    ALTER COLUMN expires_at TYPE timestamp,
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE verification_requests
    ALTER COLUMN timestamp TYPE timestamp,
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;

ALTER TABLE verification_results
    ALTER COLUMN timestamp TYPE timestamp,
    ALTER COLUMN _updated_at TYPE timestamp,
    ALTER COLUMN _created_at TYPE timestamp;