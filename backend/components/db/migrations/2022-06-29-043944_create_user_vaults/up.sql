CREATE TABLE user_vaults (
    id text PRIMARY KEY DEFAULT prefixed_uid('uv_'),  
    e_private_key BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    id_verified text NOT NULL,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW()
);

SELECT diesel_manage_updated_at('user_vaults');