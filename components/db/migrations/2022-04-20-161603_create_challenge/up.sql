CREATE TYPE challenge_kind as ENUM ('PhoneNumber', 'Email');
CREATE TYPE challenge_state as ENUM ('AwaitingResponse', 'Expired', 'Validated`');

CREATE TABLE challenge (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    sh_data BYTEA NOT NULL,
    code int NOT NULL,
    kind challenge_kind NOT NULL,
    state challenge_state NOT NULL,
    validated_at timestamp,
    CONSTRAINT challenge_user_id_fk
      FOREIGN KEY(user_id) REFERENCES fp_user(id)
);

CREATE INDEX IF NOT EXISTS challenge_user_id ON challenge(user_id);