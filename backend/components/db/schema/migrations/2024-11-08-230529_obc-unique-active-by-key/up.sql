CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  ob_configuration_unique_active_by_key
  ON ob_configuration (key)
  WHERE deactivated_at IS NULL;
