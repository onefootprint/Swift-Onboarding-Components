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
          INNER JOIN onboarding on onboarding_decision.onboarding_id = onboarding.id
          INNER JOIN scoped_vault on scoped_vault.id = onboarding.scoped_vault_id
          INNER JOIN vault on vault.id = scoped_vault.vault_id
          INNER JOIN tenant on tenant.id = scoped_vault.tenant_id
          WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND scoped_vault.is_live = true AND onboarding_decision.status = 'pass' AND vault.is_portable = 't';
          `}
        ></OverviewCard>
        <OverviewCard
          title={'KYCed users'}
          query={`
          SELECT count(distinct scoped_vault.id) FROM onboarding_decision
          INNER JOIN onboarding on onboarding_decision.onboarding_id = onboarding.id
          INNER JOIN scoped_vault on scoped_vault.id = onboarding.scoped_vault_id
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

export default airplane.view(
  {
    slug: 'stats_ui',
    name: 'Statistics',
    description: 'View high-level user/customer statistics',
  },
  Stats,
);
