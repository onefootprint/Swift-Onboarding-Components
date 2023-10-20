-- We want to evaluate the current value of data_lifetime_seqno and use it as the default for all rows
SELECT nextval('data_lifetime_seqno');
ALTER TABLE scoped_vault ADD COLUMN IF NOT EXISTS snapshot_seqno BIGINT NOT NULL DEFAULT currval('data_lifetime_seqno');