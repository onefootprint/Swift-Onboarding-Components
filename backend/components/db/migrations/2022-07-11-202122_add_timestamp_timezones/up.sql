ALTER TABLE tenants
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE tenant_api_keys
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE insight_events
    ALTER COLUMN timestamp TYPE timestamptz,
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE ob_configurations
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE user_vaults
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE onboardings
    ALTER COLUMN start_timestamp TYPE timestamptz,
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE user_data
    ALTER COLUMN deactivated_at TYPE timestamptz,
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE webauthn_credentials
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE access_events
    ALTER COLUMN timestamp TYPE timestamptz,
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE sessions
    ALTER COLUMN expires_at TYPE timestamptz,
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE verification_requests
    ALTER COLUMN timestamp TYPE timestamptz,
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;

ALTER TABLE verification_results
    ALTER COLUMN timestamp TYPE timestamptz,
    ALTER COLUMN _updated_at TYPE timestamptz,
    ALTER COLUMN _created_at TYPE timestamptz;