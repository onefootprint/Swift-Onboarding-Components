CREATE TABLE fingerprint (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id text NOT NULL,
    sh_data BYTEA NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_fingerprint_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS fingerprint_user_vault_id ON fingerprint(user_vault_id);
CREATE INDEX IF NOT EXISTS fingerprint_sh_data ON fingerprint(sh_data) WHERE deactivated_at IS NULL;

CREATE TABLE phone_number (
    id text PRIMARY KEY DEFAULT prefixed_uid('ph_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,
    e_e164 BYTEA NOT NULL,
    e_country BYTEA NOT NULL,
    is_verified BOOLEAN NOT NULL,
    priority TEXT NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_phone_number_user_valt_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS phone_number_user_vault_id ON phone_number(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS phone_number_unique_primary ON phone_number(user_vault_id) WHERE deactivated_at IS NULL AND priority = 'Primary';

CREATE TABLE email (
    id text PRIMARY KEY DEFAULT prefixed_uid('em_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,
    e_data BYTEA NOT NULL,
    is_verified BOOLEAN NOT NULL,
    priority TEXT NOT NULL,
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_email_user_valt_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS email_user_vault_id ON email(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS email_unique_primary ON email(user_vault_id) WHERE deactivated_at IS NULL AND priority = 'Primary';

CREATE TABLE address (
    id text PRIMARY KEY DEFAULT prefixed_uid('ad_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,

    e_line1 BYTEA,
    e_line2 BYTEA,
    e_city BYTEA,
    e_state BYTEA,
    e_zip BYTEA,
    e_country BYTEA,

    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_address_user_valt_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS address_user_vault_id ON address(user_vault_id);

CREATE TABLE user_basic_info (
    id text PRIMARY KEY DEFAULT prefixed_uid('ubi_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,

    e_first_name BYTEA,
    e_last_name BYTEA,
    e_dob BYTEA,
    e_ssn9 BYTEA,
    e_ssn4 BYTEA,

    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_basic_info_user_valt_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS address_user_vault_id ON user_basic_info(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS address_user_vault_id_unique ON user_basic_info(user_vault_id) WHERE deactivated_at IS NULL;