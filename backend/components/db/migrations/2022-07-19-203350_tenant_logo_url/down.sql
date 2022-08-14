ALTER TABLE ob_configurations ADD COLUMN logo_url Text;
UPDATE ob_configurations
    SET logo_url = tenants.logo_url
    FROM tenants
    WHERE ob_configurations.tenant_id = tenants.id;
ALTER TABLE tenants DROP COLUMN logo_url;