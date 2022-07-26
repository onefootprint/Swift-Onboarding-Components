ALTER TABLE sessions RENAME COLUMN data TO sealed_session_data;
ALTER TABLE sessions RENAME COLUMN key TO h_session_id;
ALTER TABLE sessions ALTER COLUMN sealed_session_data SET DEFAULT '';