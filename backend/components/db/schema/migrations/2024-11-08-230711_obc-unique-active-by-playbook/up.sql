CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  ob_configuration_unique_active_by_playbook
  ON ob_configuration (playbook_id)
  WHERE deactivated_at IS NULL;
