ALTER TABLE tenants ADD COLUMN logo_url Text;
UPDATE tenants
    SET logo_url = ob_configurations.logo_url
    FROM ob_configurations
    WHERE ob_configurations.tenant_id = tenants.id;
ALTER TABLE ob_configurations DROP COLUMN logo_url;