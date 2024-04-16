-- These VALIDATE CONSTRAINT statements will take a sharable lock (and not block inserts/updates), but these statements will take a long time to run
ALTER TABLE document_request
    VALIDATE CONSTRAINT config_not_null;