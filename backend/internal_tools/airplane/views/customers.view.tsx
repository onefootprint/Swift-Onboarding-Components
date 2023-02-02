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
    </Stack>
  );
};

const OrgList = () => {
  return (
    <Table
      id="customers"
      title="Customers"
      defaultPageSize={25}
      columns={[
        { accessor: 'count', label: '# obs' },
        { accessor: '_created_at', label: 'date created', type: 'date' },
      ]}
      task={{
        slug: 'dbquery',
        params: {
          query: `\
      SELECT tenant.name, tenant.id, tenant._created_at, COUNT(onboarding.id) from tenant
      INNER JOIN scoped_user on tenant_id=tenant.id
      INNER JOIN onboarding on onboarding.scoped_user_id = scoped_user.id
      WHERE scoped_user.is_live = 'true' AND onboarding.is_authorized = 'true'
      GROUP BY tenant.id
      ORDER BY COUNT(onboarding.id) DESC;`,
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
                `${process.env.DASHBOARD_URL}/assume?tenantId=${tenant.row.id}`,
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
            SELECT tenant_user.id as id, tenant_user.email, tenant_user._created_at as created, tenant.name as org, tenant.id as org_id FROM tenant 
            INNER JOIN tenant_rolebinding on tenant_rolebinding.tenant_id = '${tenantId}'
            INNER JOIN tenant_user on tenant_user.id = tenant_rolebinding.tenant_user_id
            ORDER BY created ASC;`,
          },
        }}
      ></Table>
    </Card>
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
