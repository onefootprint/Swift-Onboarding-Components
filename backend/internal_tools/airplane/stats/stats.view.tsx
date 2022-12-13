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

// Views documentation: https://docs.airplane.dev/views/getting-started
const Stats = () => {
  return (
    <Stack>
      <Stack direction="row">
        <Stack width={{ xs: '50%', sm: '25%' }}>
          <OnboardingStats></OnboardingStats>
        </Stack>
        <Stack width={{ xs: '50%', sm: '75%' }}>
          <Tenants></Tenants>
          <UserVaults></UserVaults>
        </Stack>
      </Stack>
    </Stack>
  );
};

const OnboardingStats = () => {
  return (
    <Table
      title="Onboardings per day"
      task={{
        slug: 'dbquery',
        params: {
          query: `\
            SELECT date_trunc('week', CAST(onboarding.start_timestamp AS timestamp)):: date AS day, count(DISTINCT onboarding.id) \
            FROM onboarding \
            GROUP BY day \
            ORDER BY day DESC;`,
        },
      }}
    />
  );
};

const Tenants = () => {
  return (
    <Card>
      <Table
        title="Tenants"
        defaultPageSize={10}
        columns={[
          { accessor: 'count', label: 'onboardings' },
          { accessor: '_created_at', label: 'created' },
        ]}
        task={{
          slug: 'dbquery',
          params: {
            query: `\
            SELECT tenant.name, tenant._created_at, COUNT(onboarding.id) from tenant \
            INNER JOIN scoped_user on tenant_id=tenant.id \
            INNER JOIN onboarding on onboarding.scoped_user_id = scoped_user.id \
            GROUP BY tenant.id \
            ORDER BY COUNT(onboarding.id) DESC ;`,
          },
        }}
      ></Table>
    </Card>
  );
};

const UserVaults = () => {
  const usersState = useComponentState('user_vaults');
  const selectedUser = usersState.selectedRow;

  return (
    <Stack>
      <Card>
        <Table
          id="user_vaults"
          title="User vaults"
          defaultPageSize={10}
          columns={[{ accessor: '_created_at', label: 'created' }]}
          rowSelection="single"
          task={{
            slug: 'dbquery',
            params: {
              query: `\
              SELECT user_vault.id, user_vault._created_at, COUNT(scoped_user.id) as onboardings FROM user_vault \
              INNER JOIN scoped_user on user_vault_id=user_vault.id \
              INNER JOIN onboarding on onboarding.scoped_user_id = scoped_user.id \
              GROUP BY user_vault.id \
              ORDER BY COUNT(scoped_user.id) DESC ;`,
            },
          }}
        ></Table>
        {selectedUser && (
          <UserVaultDetail id={selectedUser.id}></UserVaultDetail>
        )}
      </Card>
    </Stack>
  );
};

const UserVaultDetail = ({ id }) => {
  return (
    <Stack>
      <Table
        title="Vault data"
        defaultPageSize={20}
        task={{
          slug: 'dbquery',
          params: {
            query: `\
                SELECT user_vault_data.kind, created_at, committed_at FROM data_lifetime \
                INNER JOIN user_vault_data ON user_vault_data.lifetime_id=data_lifetime.id AND data_lifetime.user_vault_id='${id}';`,
          },
        }}
      ></Table>
    </Stack>
  );
};

export default Stats;
