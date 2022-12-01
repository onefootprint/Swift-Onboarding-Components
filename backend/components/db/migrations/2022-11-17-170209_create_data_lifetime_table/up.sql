-- We could have postgres automagically create this sequence with BIGSERIAL for us, but since it's
-- used in multiple columns, it's useful to keep separate
CREATE SEQUENCE data_lifetime_seqno AS BIGINT;

CREATE TABLE data_lifetime (
    id text PRIMARY KEY DEFAULT prefixed_uid('dl_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_vault_id TEXT NOT NULL,
    scoped_user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    committed_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    created_seqno BIGINT NOT NULL,
    committed_seqno BIGINT,
    deactivated_seqno BIGINT,
    CONSTRAINT fk_data_lifetime_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_data_lifetime_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS data_lifetime_user_vault_id ON data_lifetime(user_vault_id);
CREATE INDEX IF NOT EXISTS data_lifetime_scoped_user_id ON data_lifetime(scoped_user_id);

SELECT diesel_manage_updated_at('data_lifetime');


CREATE TABLE user_vault_data (
    id text PRIMARY KEY DEFAULT prefixed_uid('uvd_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lifetime_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    e_data BYTEA NOT NULL, 
    CONSTRAINT fk_user_vault_data_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS user_vault_data_lifetime_id ON user_vault_data(lifetime_id);

SELECT diesel_manage_updated_at('user_vault_data');

-- Point email at data_lifetime
ALTER TABLE email
    DROP COLUMN user_vault_id,
    DROP COLUMN fingerprint_ids,
    ADD COLUMN lifetime_id TEXT NOT NULL,
    ADD CONSTRAINT fk_email_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS email_lifetime_id ON email(lifetime_id);

-- Point phone_number at data_lifetime
ALTER TABLE phone_number
    DROP COLUMN user_vault_id,
    DROP COLUMN fingerprint_ids,
    ADD COLUMN lifetime_id TEXT NOT NULL,
    ADD CONSTRAINT fk_phone_number_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS phone_number_lifetime_id ON phone_number(lifetime_id);

-- Point fingerprint at data_lifetime
ALTER TABLE fingerprint
    DROP COLUMN user_vault_id,
    DROP COLUMN is_unique,
    DROP COLUMN deactivated_at,
    ADD COLUMN lifetime_id TEXT NOT NULL,
    ADD CONSTRAINT fk_fingerprint_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE fingerprint RENAME COLUMN data_attribute TO kind;

-- TODO in the future: might want to denormalize the concept of deactivation onto fingerprints to make this index better
CREATE INDEX IF NOT EXISTS fingerprint_sh_data ON fingerprint(sh_data);
CREATE INDEX IF NOT EXISTS fingerprint_lifetime_id ON fingerprint(lifetime_id);

-- Store a seqno on VerificationResult to reconstruct UVW
ALTER TABLE verification_request
    DROP COLUMN email_id,
    DROP COLUMN phone_number_id,
    DROP COLUMN identity_data_id,
    DROP COLUMN identity_document_id,
    ADD COLUMN uvw_snapshot_seqno BIGINT NOT NULL;

-- Drop old identity_data table
DROP TABLE IF EXISTS identity_data; -- note: i don't recreate this table in down.sql