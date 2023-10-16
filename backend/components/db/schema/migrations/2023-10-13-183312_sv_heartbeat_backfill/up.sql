-- Need this to be in a separate txn than the ALTER TABLE command
UPDATE scoped_vault SET last_heartbeat_at = _updated_at;