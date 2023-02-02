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
          title={'Customers'}
          query={
            "select count(*) from tenant WHERE tenant.id NOT LIKE '_private_it_org_%'"
          }
        ></OverviewCard>
        <OverviewCard
          title={'Portable IDs'}
          query={
            'select count(*) from user_vault where is_portable=true and is_live=true;'
          }
        ></OverviewCard>
        <OverviewCard
          title={'Live Verifications'}
          query={`
          SELECT count(*) FROM onboarding 
          INNER JOIN scoped_user on scoped_user.id = onboarding.scoped_user_id
          INNER JOIN tenant on tenant.id = scoped_user.id
          WHERE tenant.id NOT LIKE '_private_it_org_%' AND tenant.sandbox_restricted = false AND scoped_user.is_live = true AND onboarding.is_authorized = true;
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
