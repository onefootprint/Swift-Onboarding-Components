ALTER TABLE tenant
    ADD COLUMN is_prod_ob_config_restricted BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE tenant
    ALTER COLUMN is_prod_ob_config_restricted DROP DEFAULT;

-- Unrestrict launched tenants except grid
UPDATE tenant SET is_prod_ob_config_restricted = 'f' WHERE sandbox_restricted = 'f' AND id != 'org_AiK8peOw9mrqsb6yeHWEG8';