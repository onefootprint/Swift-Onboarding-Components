-- Couldn't tell you why, but even with metadata.toml, this index had to be created in a separate migration for the CLI to be happy
CREATE INDEX CONCURRENTLY IF NOT EXISTS fingerprint_sh_data_lifetime_id_not_hidden ON fingerprint(sh_data, lifetime_id) WHERE is_hidden = 'f';