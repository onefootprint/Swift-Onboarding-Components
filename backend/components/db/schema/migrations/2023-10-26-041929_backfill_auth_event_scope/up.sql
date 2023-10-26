-- Reasonable default for all auth events today since nobody is really logging into my1fp
UPDATE auth_event SET scope = 'onboarding' WHERE scope IS NULL;

ALTER TABLE auth_event ALTER COLUMN scope SET NOT NULL;