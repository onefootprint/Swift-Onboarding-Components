CREATE TABLE user_data (
    id text PRIMARY KEY DEFAULT prefixed_uid('ud_'::character varying),
    user_vault_id text NOT NULL,
    data_kind text NOT NULL,
    data_group_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    data_group_kind text NOT NULL,
    data_group_priority text NOT NULL,
    e_data bytea NOT NULL,
    sh_data bytea,
    is_verified boolean NOT NULL,
    deactivated_at timestamp with time zone,
    _created_at timestamp with time zone DEFAULT now() NOT NULL,
    _updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_user_data_user_valt_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_kind_fingerprint ON user_data(data_kind, sh_data) WHERE is_verified = TRUE AND data_kind IN ('PhoneNumber', 'Email');
CREATE INDEX IF NOT EXISTS user_data_user_vault_id_data_kind ON user_data(user_vault_id, data_kind);
CREATE INDEX IF NOT EXISTS user_data_fingerprint ON user_data(sh_data) WHERE sh_data IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_data_groups_name ON user_data(data_group_kind);
CREATE INDEX IF NOT EXISTS user_data_groups_id ON user_data(data_group_id);

-- Don't allow more than one  row to exist for each (user, data_kind)
CREATE UNIQUE INDEX IF NOT EXISTS user_data_unique_primary_data ON user_data(user_vault_id, data_kind) WHERE deactivated_at IS NULL AND data_group_priority = 'Primary';

SELECT diesel_manage_updated_at('user_data');

ALTER TABLE verification_requests_user_data ADD CONSTRAINT fk_verification_requests_user_data_user_data_id FOREIGN KEY (user_data_id) REFERENCES user_data(id);