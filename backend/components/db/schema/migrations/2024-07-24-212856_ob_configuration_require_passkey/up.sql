-- TODO drop default
ALTER TABLE ob_configuration ADD COLUMN prompt_for_passkey BOOLEAN NOT NULL DEFAULT 't';