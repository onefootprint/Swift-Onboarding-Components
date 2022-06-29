CREATE TABLE user_data (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('ud_'),
    user_vault_id VARCHAR(250) NOT NULL,
    data_kind text NOT NULL,
    e_data BYTEA NOT NULL,
    sh_data BYTEA,
    is_verified BOOLEAN NOT NULL,
    data_priority text NOT NULL,
    deactivated_at timestamp,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_valt
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id),
    -- Only allow sh_data to be null for fields other than Ssn, PhoneNumber, Email
    CONSTRAINT check_sh_data CHECK (
        ((sh_data IS NOT NULL) AND (data_kind IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
        OR ((sh_data IS NULL) AND (data_kind NOT IN ('Ssn', 'PhoneNumber', 'Email', 'FirstName', 'LastName', 'LastFourSsn')))
    )
);

-- Don't allow multiple verified UserData rows to exist with the same Ssn, PhoneNumber, or Email fingerprint
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_kind_fingerprint ON user_data(data_kind, sh_data) WHERE is_verified = TRUE AND data_kind IN ('Ssn', 'PhoneNumber', 'Email');
-- Don't allow more than one Primary, active UserData row to exist for each (user, data_kind)
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_primary_data ON user_data(user_vault_id, data_kind) WHERE deactivated_at IS NULL AND data_priority = 'Primary';
CREATE INDEX IF NOT EXISTS user_data_user_vault_id_data_kind ON user_data(user_vault_id, data_kind);
CREATE INDEX IF NOT EXISTS user_data_fingerprint ON user_data(sh_data) WHERE sh_data IS NOT NULL;

SELECT diesel_manage_updated_at('user_data');