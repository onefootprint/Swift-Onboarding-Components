CREATE TABLE identity_data (
    id text PRIMARY KEY DEFAULT prefixed_uid('identity_'),
    user_vault_id text NOT NULL,
    fingerprint_ids UUID[] NOT NULL,

    e_first_name BYTEA,
    e_last_name BYTEA,
    e_dob BYTEA,
    e_ssn9 BYTEA,
    e_ssn4 BYTEA,

    e_address_line1 BYTEA,
    e_address_line2 BYTEA,
    e_address_city BYTEA,
    e_address_state BYTEA,
    e_address_zip BYTEA,
    e_address_country BYTEA,

    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_id_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS id_data_user_vault_id ON identity_data(user_vault_id);
 