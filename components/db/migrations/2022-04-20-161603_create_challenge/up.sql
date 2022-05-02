CREATE TYPE challenge_kind as ENUM ('PhoneNumber', 'Email', 'Biometric');
CREATE TYPE challenge_state as ENUM ('AwaitingResponse', 'Expired', 'Validated');

CREATE TABLE challenges (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id VARCHAR(250) NOT NULL,
    sh_data BYTEA NOT NULL,
    h_code BYTEA NOT NULL,
    kind challenge_kind NOT NULL,
    state challenge_state NOT NULL,
    expires_at timestamp NOT NULL,
    validated_at timestamp,
    CONSTRAINT challenge_user_id_fk
      FOREIGN KEY(user_vault_id) REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS challenge_user_vault_id ON challenges(user_vault_id);