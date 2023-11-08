import {
  Stack,
  Table,
  useComponentState,
  Checkbox,
  Card,
  Button,
  Label,
} from '@airplane/views';

import airplane from 'airplane';

const NON_CORPORATE_DOMAINS = [
  'gmail.com',
  'icloud.com',
  'yahoo.com',
  'live.com',
  'msn.com',
  'hotmail.com',
  'aol.com',
  'outlook.com',
];

const Customers = () => {
  const customersTable = useComponentState('customers');
  const { id: onlyCorporateId, value: onlyCorporate } = useComponentState();

  return (
    <Stack>
      <Checkbox
        id={onlyCorporateId}
        label="Only corporate email domains"
        defaultChecked
      ></Checkbox>
      <h1>Customers</h1>
      <Label>Select a row to view a customer's team members</Label>
      <OrgList onlyCorporate={onlyCorporate}></OrgList>
      {customersTable.selectedRow ? (
        <OrgUsers tenantId={customersTable.selectedRow.id}></OrgUsers>
      ) : (
        <></>
      )}
      <Logins onlyCorporate={onlyCorporate}></Logins>
    </Stack>
  );
};

const OrgList = ({ onlyCorporate }: { onlyCorporate: boolean }) => {
  const extraFilters = onlyCorporate
    ? NON_CORPORATE_DOMAINS.map(d => `AND tenant.name NOT LIKE '%${d}'`).join(
        '\n',
      )
    : '';

  return (
    <Table
      id="customers"
      title="Customers"
      defaultPageSize={25}
      task={{
        slug: 'dbquery',
        params: {
          query: `
          SELECT
            tenant.id,
            tenant.name,
            tenant.sandbox_restricted,
            tenant._created_at,
            MAX(sv.start_timestamp) as last_user_created_at,
            COUNT(sv.id) FILTER (WHERE sv.is_live = 't') AS live_total,
            COUNT(sv.id) FILTER (WHERE sv.is_live = 't' and wf.authorized_at IS NOT NULL) AS live_with_kyc,
            COUNT(sv.id) FILTER (WHERE sv.is_live = 'f') AS sandbox_total,
            COUNT(sv.id) FILTER (WHERE sv.is_live = 'f' and wf.authorized_at IS NOT NULL) AS sandbox_with_kyc
          FROM tenant
            LEFT JOIN scoped_vault as sv ON sv.tenant_id=tenant.id
            LEFT JOIN workflow as wf ON wf.scoped_vault_id = sv.id AND wf.kind in ('kyc', 'alpaca_kyc')
          WHERE tenant.id NOT LIKE '_private_it%'
          ${extraFilters}
          GROUP BY tenant.id
          ORDER BY tenant.sandbox_restricted, last_user_created_at DESC, tenant._created_at DESC;
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

//
const Logins = ({ onlyCorporate }: { onlyCorporate: boolean }) => {
  const { id: onlyNonLiveId, value: onlyNonLive } = useComponentState();
  const extraFilters: string[] = [];
  if (onlyCorporate) {
    NON_CORPORATE_DOMAINS.forEach(d =>
      extraFilters.push(`AND tenant_user.email NOT LIKE '%${d}'`),
    );
  }
  if (onlyNonLive) {
    extraFilters.push(`AND tenant.sandbox_restricted ='t'`);
  }
  const extraFiltersStr = extraFilters.join('\n');
  return (
    <Stack>
      <h1>Recent activity</h1>
      <Label>
        Below is a list of users who have signed up for the dashboard - order by
        "last active" to see who has been active most recently.
      </Label>
      <Checkbox
        id={onlyNonLiveId}
        label="Only logins for non-live customers"
        defaultChecked
      ></Checkbox>
      <Table
        id="signups"
        title="Dashboard Logins (corporate emails only)"
        defaultPageSize={25}
        columns={[
          { accessor: 'email', label: 'Email', type: 'string' },
          { accessor: 'created_at', label: 'Joined on', type: 'datetime' },
          {
            accessor: 'last_login_at',
            label: 'Last dashboard login at',
            type: 'datetime',
          },
          { accessor: 'org', label: 'Tenant name', type: 'string' },
          { accessor: 'first_name', label: 'First name', type: 'string' },
          { accessor: 'last_name', label: 'Last name', type: 'string' },
          { accessor: 'org_id', label: 'tenant_id', type: 'string' },
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
          WHERE tenant.id NOT LIKE '_private_it%'
          AND tenant_user.email NOT LIKE '%@onefootprint.com' ${extraFiltersStr}
          ORDER BY trb.created_at DESC;
          `,
          },
        }}
      ></Table>
    </Stack>
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
