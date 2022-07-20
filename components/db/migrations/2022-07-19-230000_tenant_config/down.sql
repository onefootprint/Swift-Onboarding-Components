DROP INDEX IF EXISTS tenants_profile_id;

UPDATE tenants SET workos_id=prefixed_uid('workos_org_fake_') WHERE workos_id IS NULL;
ALTER TABLE tenants ALTER COLUMN workos_id SET NOT NULL;

ALTER TABLE tenants DROP COLUMN workos_admin_profile_id;
ALTER TABLE tenants ADD COLUMN email_domain VARCHAR(250) NOT NULL DEFAULT '';

