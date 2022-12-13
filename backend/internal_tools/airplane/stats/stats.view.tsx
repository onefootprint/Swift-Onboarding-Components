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
        <OverviewCard
          title={'Customers'}
          query={
            "select count(*) from tenant where name not like 'Acme%' and name not like 'foo' and name not like 'bar' and name not like '%document tenant';"
          }
        ></OverviewCard>
        <OverviewCard
          title={'Portable identities'}
          query={
            'select count(*) from user_vault where is_portable=true and is_live=true;'
          }
        ></OverviewCard>
      </Stack>
      <OnboardingStats></OnboardingStats>
      <TenantUsers></TenantUsers>
      <Tenants></Tenants>
      <UserVaults></UserVaults>
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

  console.log(output);
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

const OnboardingStats = () => {
  return (
    <Card>
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
    </Card>
  );
};

const TenantUsers = () => {
  return (
    <Card>
      <Table
        title="Org Users"
        defaultPageSize={10}
        columns={[
          { accessor: 'count', label: 'onboardings' },
          { accessor: '_created_at', label: 'created' },
        ]}
        task={{
          slug: 'dbquery',
          params: {
            query: `\
            SELECT tenant_user.email, tenant_user._created_at, tenant.name as org FROM tenant \
            INNER JOIN tenant_user on tenant_user.tenant_id = tenant.id \
            WHERE email NOT LIKE '%@onefootprint.com' ORDER BY _created_at DESC;`,
          },
        }}
      ></Table>
    </Card>
  );
};

const Tenants = () => {
  return (
    <Card>
      <Table
        title="Orgs"
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
