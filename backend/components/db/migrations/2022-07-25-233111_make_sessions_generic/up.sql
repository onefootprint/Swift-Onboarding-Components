ALTER TABLE sessions ALTER COLUMN sealed_session_data DROP DEFAULT;
ALTER TABLE sessions RENAME COLUMN sealed_session_data TO data;
ALTER TABLE sessions RENAME COLUMN h_session_id TO key;