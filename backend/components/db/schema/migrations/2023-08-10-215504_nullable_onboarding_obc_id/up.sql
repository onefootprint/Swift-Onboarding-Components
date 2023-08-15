ALTER TABLE onboarding
    ALTER COLUMN ob_configuration_id DROP NOT NULL,
    ALTER COLUMN status DROP NOT NULL;