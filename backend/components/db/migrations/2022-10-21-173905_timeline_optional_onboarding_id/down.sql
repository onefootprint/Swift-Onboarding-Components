UPDATE user_timeline SET onboarding_id=onboarding.id
    FROM scoped_user
    INNER JOIN onboarding
        ON onboarding.scoped_user_id = scoped_user.id
    WHERE user_timeline.user_vault_id = scoped_user.user_vault_id;

ALTER TABLE user_timeline ALTER COLUMN onboarding_id SET NOT NULL,
    DROP COLUMN user_vault_id;