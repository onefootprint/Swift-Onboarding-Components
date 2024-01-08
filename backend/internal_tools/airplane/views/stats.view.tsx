import {
  Stack,
  Table,
  Title,
  Card,
  Text,
  Button,
  useTaskQuery,
  Loader,
  Chart,
} from '@airplane/views';

import { useState } from 'react';
import airplane from 'airplane';

// Add your own select clause to this query
const NYPID_QUERY = `
FROM vault 
INNER JOIN scoped_vault on scoped_vault.vault_id = vault.id
INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
WHERE
  vault.is_portable = 'f' AND
  vault.is_live = 't' AND
  vault.is_created_via_api = 't' AND
  -- This is technically needed for correctness since only id data is portablizable. But this slows
  -- down the query a lot, and doesn't make a huge difference on numbers
  -- vault.id IN (
  --    SELECT vault_id
  --    FROM data_lifetime
  --    WHERE kind ilike 'id.%'
  -- ) AND
  tenant.sandbox_restricted = false AND
  tenant.is_demo_tenant='f'
`;

// Add your own select clause to this query
const PID_QUERY = `
FROM vault
INNER JOIN scoped_vault on scoped_vault.vault_id = vault.id
INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
WHERE
  vault.is_portable = 't' AND
  vault.is_live = 't' AND
  tenant.id NOT LIKE '_private_it_org_%' AND
  tenant.sandbox_restricted = false AND
  scoped_vault.is_live = true
`;

// Views documentation: https://docs.airplane.dev/views/getting-started
const Stats = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Stack>
      <Stack direction="row">
        <OverviewCard
          title={'Live Customers'}
          query={
            "select count(*) from tenant WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND id != 'org_hyZP3ksCvsT0AlLqMZsgrI' AND id != 'org_e2FHVfOM5Hd3Ce492o5Aat'"
          }
        ></OverviewCard>
        <OverviewCard
          title={'Portable IDs'}
          query={`
          SELECT count(distinct vault.id)
          ${PID_QUERY};
          `}
        ></OverviewCard>
        <OverviewCard
          title={'KYCed users'}
          query={`
          SELECT count(distinct scoped_vault.id) FROM onboarding_decision
          INNER JOIN workflow on onboarding_decision.workflow_id = workflow.id
          INNER JOIN scoped_vault on scoped_vault.id = workflow.scoped_vault_id
          INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
          WHERE
            tenant.is_demo_tenant='f' AND
            tenant.sandbox_restricted = false AND
            scoped_vault.is_live = true AND
            onboarding_decision.status = 'pass' AND
            onboarding_decision.actor ->> 'kind' = 'footprint';
          `}
        ></OverviewCard>
        <OverviewCard
          title={'Not (yet) Portable IDs'}
          query={`
          SELECT count(distinct vault.id)
          ${NYPID_QUERY};
          `}
        ></OverviewCard>
      </Stack>
      <Stack>
        <GraphCard
          title={'PIDs last 30 days'}
          transform={null}
          colors={null}
          query={`
          SELECT "day", "new vaults"
          FROM (
            SELECT
              to_char(scoped_vault.start_timestamp at time zone '${timezone}', 'YYYY-MM-DD') AS "day",
              count(distinct vault.id) as "new vaults"
            ${PID_QUERY}
            GROUP BY "day"
            ORDER BY "day" DESC LIMIT 30
          ) r 
          ORDER BY "day" ASC;
        `}
        ></GraphCard>
        <GraphCard
          title={'PIDs this week (by org)'}
          colors={{
            'findigs.com': 'blue',
            Flexcar: 'teal',
            Composer: 'orange',
            Coba: 'green',
            Fractional: 'yellow',
            Bloom: 'lime',
            'Basic Capital': 'indigo',
            Trayd: 'black',
            'Footprint Live': 'blue',
          }}
          transform={data => {
            let map = {};
            let tenants = {};

            for (const row of data) {
              if (map[row.day]) {
                map[row.day][row.tenant] = row.new_vaults;
              } else {
                map[row.day] = { day: row.day, [row.tenant]: row.new_vaults };
              }
              tenants[row.tenant] = true;
            }
            console.log('map', map);
            console.log('tenants', tenants);

            for (const [key, _] of Object.entries(map)) {
              for (const [tenant, _] of Object.entries(tenants)) {
                if (map[key][tenant]) {
                } else {
                  map[key][tenant] = 0;
                }
              }
            }

            let out = Object.values(map);
            out.sort();
            return out;
          }}
          query={`
            WITH vault_counts_per_day AS (
                SELECT
                  to_char(scoped_vault.start_timestamp at time zone '${timezone}', 'YYYY-MM-DD') AS "day",
                  tenant.name as "tenant",
                  count(distinct vault.id) as "new_vaults"
                ${PID_QUERY}
                  AND start_timestamp > current_timestamp - '7 days'::interval  
                GROUP BY 1, 2
                ORDER BY 1, 2
              )          
            SELECT day, tenant, new_vaults from vault_counts_per_day;
        `}
        ></GraphCard>

        {/* TODO same here as well */}
        <GraphCard
          title={'Not (yet) Portable IDs last 30 days'}
          transform={null}
          colors={null}
          query={`
          SELECT
            "day", "new vaults" from (SELECT to_char(scoped_vault.start_timestamp at time zone '${timezone}', 'YYYY-MM-DD') AS "day",
            count(distinct vault.id) as "new vaults"
          ${NYPID_QUERY}
          GROUP BY "day"
          ORDER BY "day" DESC LIMIT 30) r 
          ORDER BY "day" ASC;
        `}
        ></GraphCard>

        <Table
          id="verif_rate"
          title="Verification Rate"
          defaultPageSize={25}
          rowActions={tenant => (
            <Stack>
              <Button
                variant="subtle"
                compact
                onClick={() => {
                  window.open(
                    `${
                      process.env.DASHBOARD_URL ??
                      'https://dashboard.onefootprint.com'
                    }/assume?tenantId=${tenant.row.id}`,
                    '_BLANK',
                  );
                }}
              >
                Assume
              </Button>
            </Stack>
          )}
          task={{
            slug: 'dbquery',
            params: {
              query: `
              select 
                t.id, 
                t.name,
                sum(cast(sv.status != 'incomplete' as int)) as completed,
                ROUND(sum(cast(sv.status = 'pass' as int)) * 1.00 / sum(cast(sv.status != 'incomplete' as int)), 2) as pass_rate,
                sum(cast(sv.status = 'pass' as int)) as passes,
                sum(cast(sv.status = 'fail' as int)) as fails,
                sum(cast(sv.status = 'incomplete' as int)) as incompletes
              from scoped_vault sv
              join tenant t on t.id = sv.tenant_id
              where sv._created_at > '2023-09-24'
                and t.is_demo_tenant='f'
                and sv.is_live
              group by 1,2
            `,
            },
          }}
        ></Table>
      </Stack>
    </Stack>
  );
};

const OverviewCard = ({ title, query }) => {
  const { output, loading, error } = useTaskQuery({
    slug: 'dbquery',
    params: {
      query: query,
    },
  });

  return (
    <Card>
      <Stack>
        <Text size="xl" weight={700}>
          {title}
        </Text>
        {loading ? (
          <Loader variant="dots" />
        ) : error ? (
          <Text color="error">{error.message}</Text>
        ) : (
          <Title color="green">{output[0].count}</Title>
        )}
      </Stack>
    </Card>
  );
};

const GraphCard = ({ title, query, transform, colors }) => {
  const { output, loading, error } = useTaskQuery({
    slug: 'dbquery',
    params: {
      query: query,
    },
  });

  return (
    <Card>
      <Stack>
        <Text size="xl" weight={700}>
          {title}
        </Text>
        {loading ? (
          <Loader variant="dots" />
        ) : error ? (
          <Text color="error">{error.message}</Text>
        ) : (
          <Chart
            type="bar"
            xAxis="day"
            colors={colors}
            data={transform !== null ? transform(output) : output}
          />
        )}
      </Stack>
    </Card>
  );
};

export default airplane.view(
  {
    slug: 'stats_ui',
    name: 'Statistics',
    description: 'View high-level user/customer statistics',
    envVars: {
      DASHBOARD_URL: { config: 'DASHBOARD_URL' },
    },
  },
  Stats,
);
