ALTER TABLE data_lifetime RENAME COLUMN committed_at TO portablized_at;
ALTER TABLE data_lifetime RENAME COLUMN committed_seqno TO portablized_seqno;