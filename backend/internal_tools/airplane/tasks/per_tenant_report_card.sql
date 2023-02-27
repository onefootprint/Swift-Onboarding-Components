-- Select all the tenants that we'll include in the report card
WITH live_tenant AS (
  SELECT * FROM TENANT
  WHERE sandbox_restricted = 'f' AND id NOT LIKE '_private_it_org_%'
),
-- List of data identifiers
identifiers_per_tenant AS (
  SELECT
    live_tenant.id as tenant_id,
    array_agg(distinct data_lifetime.kind) as all_keys
  FROM live_tenant
  INNER JOIN scoped_user
    ON scoped_user.tenant_id = live_tenant.id AND scoped_user.is_live = 't'
  INNER JOIN data_lifetime
    ON scoped_user.id = data_lifetime.scoped_user_id
  GROUP BY 1
),
-- Number of scoped users
scoped_users_per_tenant AS (
  SELECT
    live_tenant.id as tenant_id,
    COUNT(distinct scoped_user.id) AS count
  FROM live_tenant
  INNER JOIN scoped_user
    ON scoped_user.tenant_id = live_tenant.id AND scoped_user.is_live = 't'
  GROUP BY 1
),
-- Scoped user with max number of data identifiers
num_keys_per_scoped_user AS (
  SELECT
    live_tenant.id as tenant_id,
    scoped_user.id as scoped_user_id,
    count(distinct kind) as num_keys
  FROM live_tenant
  INNER JOIN scoped_user
    ON scoped_user.tenant_id = live_tenant.id AND scoped_user.is_live = 't'
  INNER JOIN data_lifetime
    ON scoped_user.id = data_lifetime.scoped_user_id
  GROUP BY 1, 2
),
max_num_keys_per_su_per_tenant AS (
  SELECT
    tenant_id,
    MAX(num_keys) as max
  FROM num_keys_per_scoped_user
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
)
-- Join all the results from subqueries into one table
SELECT
  live_tenant.id as tenant_id,
  live_tenant.name,
  identifiers_per_tenant.all_keys,
  scoped_users_per_tenant.count as num_scoped_users,
  max_num_keys_per_su_per_tenant.max as max_keys_per_user,
  num_proxy_requests_per_tenant.count as num_proxy_reqs
FROM live_tenant
FULL JOIN identifiers_per_tenant
  ON identifiers_per_tenant.tenant_id = live_tenant.id
FULL JOIN scoped_users_per_tenant
  ON scoped_users_per_tenant.tenant_id = live_tenant.id
FULL JOIN max_num_keys_per_su_per_tenant
  ON max_num_keys_per_su_per_tenant.tenant_id = live_tenant.id
FULL JOIN num_proxy_requests_per_tenant
  ON num_proxy_requests_per_tenant.tenant_id = live_tenant.id;
