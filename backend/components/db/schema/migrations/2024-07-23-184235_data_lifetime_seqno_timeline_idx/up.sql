-- Used to correlate a given timestamp with the seqno that was active at that time
CREATE INDEX CONCURRENTLY IF NOT EXISTS data_lifetime_seqno_timeline ON data_lifetime(created_at, created_seqno);