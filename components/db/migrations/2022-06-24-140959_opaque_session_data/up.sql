ALTER TABLE sessions 
    DROP COLUMN session_data;

ALTER TABLE sessions
  ADD COLUMN sealed_session_data BYTEA NOT NULL DEFAULT '';
