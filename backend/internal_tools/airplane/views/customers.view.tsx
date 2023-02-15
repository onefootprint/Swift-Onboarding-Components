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
  Label,
} from '@airplane/views';

import { useState } from 'react';
import airplane from 'airplane';

const Customers = () => {
  const customersTable = useComponentState('customers');

  return (
    <Stack>
      <h1>Customers</h1>
      <Label>Select a row to view a customer's team members</Label>
      <OrgList></OrgList>
      {customersTable.selectedRow ? (
        <OrgUsers tenantId={customersTable.selectedRow.id}></OrgUsers>
      ) : (
        <></>
      )}
      <Signups></Signups>
    </Stack>
  );
};

const OrgList = () => {
  return (
    <Table
      id="customers"
      title="Customers"
      defaultPageSize={25}
      columns={[{ accessor: '_created_at', label: 'created', type: 'date' }]}
      task={{
        slug: 'dbquery',
        params: {
          query: `
          SELECT
            tenant.id,
            tenant.name,
            tenant.sandbox_restricted,
            tenant._created_at,
            COUNT(su.id) FILTER (WHERE su.is_live = 't') AS live,
            COUNT(su.id) FILTER (WHERE su.is_live = 'f') AS sandbox
          FROM tenant
            INNER JOIN scoped_user as su ON su.tenant_id=tenant.id
            INNER JOIN onboarding as ob ON ob.scoped_user_id=su.id
          WHERE tenant.id NOT LIKE '_private_it%' and ob.authorized_at IS NOT NULL
          GROUP BY tenant.id;
          `,
        },
      }}
      rowSelection="single"
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
    ></Table>
  );
};

type OrgUserProps = {
  tenantId: string;
};

const OrgUsers = ({ tenantId }: OrgUserProps) => {
  return (
    <Card>
      <Table
        title="Org Members"
        defaultPageSize={25}
        task={{
          slug: 'dbquery',
          params: {
            query: `
            SELECT tenant_user.id as id, tenant_user.email, tenant_user._created_at as created FROM tenant 
            INNER JOIN tenant_rolebinding on tenant_rolebinding.tenant_id = tenant.id
            INNER JOIN tenant_user on tenant_user.id = tenant_rolebinding.tenant_user_id
            WHERE tenant.id = '${tenantId}'
            ORDER BY created ASC;`,
          },
        }}
      ></Table>
    </Card>
  );
};

const Signups = () => {
  return (
    <Table
      id="signups"
      title="Dashboard Sign-ups"
      defaultPageSize={25}
      columns={[
        { accessor: 'created_at', label: 'joined', type: 'date' },
        { accessor: 'last_login_at', label: 'last active', type: 'date' },
      ]}
      task={{
        slug: 'dbquery',
        params: {
          query: `
          SELECT
            tenant_user.email,
            trb.created_at,
            trb.last_login_at,
            tenant.name as org,
            tenant_user.first_name,
            tenant_user.last_name,
            tenant.id as org_id
          FROM tenant_user
            INNER JOIN tenant_rolebinding as trb ON trb.tenant_user_id=tenant_user.id
            INNER JOIN tenant on tenant.id=trb.tenant_id
          WHERE tenant.id NOT LIKE '_private_it%' AND tenant_user.email NOT LIKE '%@onefootprint.com'
          ORDER BY trb.created_at DESC;
          `,
        },
      }}
    ></Table>
  );
};

export default airplane.view(
  {
    slug: 'customers',
    name: 'Customer Overview',
    description: 'Customer list',
    envVars: {
      DASHBOARD_URL: { config: 'DASHBOARD_URL' },
    },
  },
  Customers,
);
