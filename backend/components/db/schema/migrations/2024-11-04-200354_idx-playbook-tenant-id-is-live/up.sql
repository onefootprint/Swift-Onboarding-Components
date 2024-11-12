CREATE INDEX CONCURRENTLY IF NOT EXISTS
  playbook_tenant_id_is_live
  ON playbook (tenant_id, is_live);
