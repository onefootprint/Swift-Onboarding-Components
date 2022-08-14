CREATE TABLE sessions (
    h_session_id VARCHAR(250) PRIMARY KEY NOT NULL,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    expires_at timestamp NOT NULL,
    sealed_session_data BYTEA NOT NULL DEFAULT ''
);

CREATE FUNCTION expire_sessions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            -- Delete rows in the sessions table that have been expired for 30 minutes
            DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '30 minutes';
            RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_sessions
    AFTER INSERT ON sessions
    EXECUTE PROCEDURE expire_sessions();
    
SELECT diesel_manage_updated_at('sessions');