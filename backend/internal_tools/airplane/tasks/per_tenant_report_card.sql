-- Select all the tenants that we'll include in the report card
WITH live_tenant AS (
  SELECT * FROM TENANT
  WHERE sandbox_restricted = 'f' AND id NOT LIKE '_private_it_org_%'
),
-- List of data identifiers
identifiers_per_tenant AS (
  SELECT
    live_tenant.id as tenant_id,
    COUNT(DISTINCT data_lifetime.kind) as count_keys
  FROM live_tenant
  INNER JOIN scoped_vault
    ON scoped_vault.tenant_id = live_tenant.id AND scoped_vault.is_live = 't'
  INNER JOIN data_lifetime
    ON scoped_vault.id = data_lifetime.scoped_vault_id
  GROUP BY 1
),
-- Number of scoped users
scoped_vaults_per_tenant AS (
  SELECT
    live_tenant.id as tenant_id,
    COUNT(distinct scoped_vault.id) AS count
  FROM live_tenant
  INNER JOIN scoped_vault
    ON scoped_vault.tenant_id = live_tenant.id AND scoped_vault.is_live = 't'
  GROUP BY 1
),
-- Scoped user with max number of data identifiers
num_keys_per_scoped_vault AS (
  SELECT
    live_tenant.id as tenant_id,
    scoped_vault.id as scoped_vault_id,
    count(distinct kind) as num_keys
  FROM live_tenant
  INNER JOIN scoped_vault
    ON scoped_vault.tenant_id = live_tenant.id AND scoped_vault.is_live = 't'
  INNER JOIN data_lifetime
    ON scoped_vault.id = data_lifetime.scoped_vault_id
  GROUP BY 1, 2
),
max_num_keys_per_su_per_tenant AS (
  SELECT
    tenant_id,
    MAX(num_keys) as max
  FROM num_keys_per_scoped_vault
  GROUP BY 1
),
-- Number of total proxy requests
num_proxy_requests_per_tenant AS (
  SELECT
    live_tenant.id as tenant_id,
    COUNT(proxy_request_log.id) AS count
  FROM live_tenant
  INNER JOIN proxy_request_log
    ON live_tenant.id = proxy_request_log.tenant_id
  GROUP BY 1
),
-- Number users that have been accessed or updated in the last 7 days
hot_users_last_7_days AS (
  SELECT
    live_tenant.id as tenant_id,
    COUNT(DISTINCT scoped_vault_id) as count_accesses -- all of decrypt, update, delete. Maybe filter out delete
  FROM live_tenant
  INNER JOIN scoped_vault
    ON scoped_vault.tenant_id = live_tenant.id AND scoped_vault.is_live = 't'
  INNER JOIN access_event
    ON access_event.scoped_vault_id = scoped_vault.id
  WHERE access_event.timestamp > current_timestamp - '7 days'::interval
  GROUP BY 1
)
-- Join all the results from subqueries into one table
SELECT
  live_tenant.id as tenant_id,
  live_tenant.name,
  identifiers_per_tenant.count_keys,
  scoped_vaults_per_tenant.count as num_scoped_vaults,
  max_num_keys_per_su_per_tenant.max as max_keys_per_user,
  num_proxy_requests_per_tenant.count as num_proxy_reqs,
  hot_users_last_7_days.count_accesses as num_hot_users
FROM live_tenant
FULL JOIN identifiers_per_tenant
  ON identifiers_per_tenant.tenant_id = live_tenant.id
FULL JOIN scoped_vaults_per_tenant
  ON scoped_vaults_per_tenant.tenant_id = live_tenant.id
FULL JOIN max_num_keys_per_su_per_tenant
  ON max_num_keys_per_su_per_tenant.tenant_id = live_tenant.id
FULL JOIN num_proxy_requests_per_tenant
  ON num_proxy_requests_per_tenant.tenant_id = live_tenant.id
FULL JOIN hot_users_last_7_days
  ON hot_users_last_7_days.tenant_id = live_tenant.id;
