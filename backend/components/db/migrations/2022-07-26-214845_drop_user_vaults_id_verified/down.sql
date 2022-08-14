ALTER TABLE user_vaults ADD COLUMN id_verified TEXT NOT NULL DEFAULT 'Incomplete';
ALTER TABLE user_vaults ALTER COLUMN id_verified DROP DEFAULT;