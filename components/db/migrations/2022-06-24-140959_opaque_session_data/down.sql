ALTER TABLE sessions 
    DROP COLUMN sealed_session_data;

ALTER TABLE sessions
  ADD COLUMN session_data JSONB NOT NULL DEFAULT '{}';
