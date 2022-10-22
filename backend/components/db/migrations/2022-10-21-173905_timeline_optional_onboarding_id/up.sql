ALTER TABLE user_timeline ALTER COLUMN onboarding_id DROP NOT NULL,
    ADD COLUMN user_vault_id TEXT NOT NULL,
    ADD CONSTRAINT fk_user_timeline_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id);

CREATE INDEX IF NOT EXISTS user_timeline_user_vault_id ON user_timeline(user_vault_id);