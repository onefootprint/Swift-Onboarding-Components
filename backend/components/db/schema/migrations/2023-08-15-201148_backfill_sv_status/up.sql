UPDATE scoped_vault set
STATUS = 'incomplete'
WHERE status IS NULL AND id IN (SELECT scoped_vault_id FROM onboarding);