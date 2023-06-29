ALTER TABLE scoped_user
    ALTER COLUMN fp_user_id SET DEFAULT prefixed_uid('fp_id_'),
    ALTER COLUMN id SET DEFAULT prefixed_uid('su_');

ALTER TABLE user_vault
    ALTER COLUMN id SET DEFAULT prefixed_uid('uv_');