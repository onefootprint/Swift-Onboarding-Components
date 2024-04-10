CREATE UNIQUE INDEX IF NOT EXISTS tenant_role_unique_name_for_partner_tenant_id_kind ON tenant_role(partner_tenant_id, kind, lower(name)) WHERE deactivated_at IS NULL;
