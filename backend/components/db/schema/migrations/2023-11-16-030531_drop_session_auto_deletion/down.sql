CREATE FUNCTION expire_sessions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            -- Delete rows in the session table that have been expired for 30 minutes
            DELETE FROM session WHERE expires_at < NOW() - INTERVAL '30 minutes';
            RETURN NEW;
        END;
    $$;

CREATE TRIGGER expire_sessions
    AFTER INSERT ON session
    EXECUTE PROCEDURE expire_sessions();