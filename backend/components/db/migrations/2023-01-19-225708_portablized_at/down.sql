ALTER TABLE data_lifetime RENAME COLUMN portablized_at TO committed_at;
ALTER TABLE data_lifetime RENAME COLUMN portablized_seqno TO committed_seqno;