import {
  Stack,
  Table,
  Title,
  useComponentState,
  CodeInput,
  Card,
  Text,
  TextInput,
  Code,
  Button,
  useTaskQuery,
  useTaskMutation,
  Loader,
  Chart,
} from '@airplane/views';

import { useState } from 'react';
import airplane from 'airplane';

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
          SELECT count(distinct scoped_vault.id) FROM onboarding_decision
          INNER JOIN workflow on onboarding_decision.workflow_id = workflow.id
          INNER JOIN scoped_vault on scoped_vault.id = workflow.scoped_vault_id
          INNER JOIN vault on vault.id = scoped_vault.vault_id
          INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
          WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND scoped_vault.is_live = true AND onboarding_decision.status = 'pass' AND vault.is_portable = 't';
          `}
        ></OverviewCard>
        <OverviewCard
          title={'KYCed users'}
          query={`
          SELECT count(distinct scoped_vault.id) FROM onboarding_decision
          INNER JOIN workflow on onboarding_decision.workflow_id = workflow.id
          INNER JOIN scoped_vault on scoped_vault.id = workflow.scoped_vault_id
          INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
          WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND scoped_vault.is_live = true AND onboarding_decision.status = 'pass';
          `}
        ></OverviewCard>
        <OverviewCard
          title={'Not (yet) Portable IDs'}
          query={`
          SELECT count(*) FROM scoped_vault 
          INNER JOIN vault on scoped_vault.vault_id = vault.id
          INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
          WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND scoped_vault.is_live = true AND vault.is_portable = 'f'
          `}
        ></OverviewCard>
        <GraphCard
          title={'Portable IDs this week'}
          query={`
          SELECT "day", "new vaults" from (SELECT to_char(scoped_vault.start_timestamp at time zone '${timezone}', 'YYYY-MM-DD') AS "day", count(*) as "new vaults" FROM scoped_vault
          INNER JOIN vault on scoped_vault.vault_id = vault.id
          INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
          WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND scoped_vault.is_live = true AND vault.is_portable = 't'
          GROUP BY "day"
          ORDER BY "day" DESC LIMIT 7) r 
          ORDER BY "day" ASC;
        `}
        ></GraphCard>
        <GraphCard
          title={'Not (yet) Portable IDs this week'}
          query={`
          SELECT "day", "new vaults" from (SELECT to_char(scoped_vault.start_timestamp at time zone '${timezone}', 'YYYY-MM-DD') AS "day", count(*) as "new vaults" FROM scoped_vault
          INNER JOIN vault on scoped_vault.vault_id = vault.id
          INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
          WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND scoped_vault.is_live = true AND vault.is_portable = 'f'
          GROUP BY "day"
          ORDER BY "day" DESC LIMIT 7) r 
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

const GraphCard = ({ title, query }) => {
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
          <Chart type="bar" data={output} />
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
