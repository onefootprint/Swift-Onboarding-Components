import { getPrivateAccessRequestsOptions } from '@onefootprint/axios/dashboard';
import type { AccessRequest } from '@onefootprint/request-types/dashboard';
import { Table, Tabs } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Row from './components/row';

const SeeEmployeesWithEditRights = () => {
  const { data, isPending } = useQuery(getPrivateAccessRequestsOptions());
  const activeAccessRequests = data?.filter(accessRequest => accessRequest.expiresAt > new Date().toISOString());
  const grantedAccessRequests = activeAccessRequests?.filter(accessRequest => accessRequest.approved);
  const pendingAccessRequests = activeAccessRequests?.filter(accessRequest => !accessRequest.approved);
  const [activeTab, setActiveTab] = useState<'granted' | 'pending'>('granted');

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      text: 'Employee',
      width: '20%',
    },
    {
      key: 'tenant',
      label: 'Tenant',
      text: 'Tenant',
      width: '20%',
    },
    {
      key: 'permissibleAttributes',
      label: 'Permissible Attributes',
      text: 'Permissible Attributes',
      width: '40%',
    },
    {
      key: 'editRightsDuration',
      label: 'Edit Rights Duration',
      text: 'Edit Rights Duration',
      width: '20%',
    },
    {
      key: 'actions',
      label: '',
      text: '',
      width: '5%',
    },
  ];

  const renderTable = (items?: AccessRequest[]) => (
    <Table<AccessRequest>
      aria-label="Employees with edit rights"
      columns={columns}
      getKeyForRow={() => ''}
      isLoading={isPending}
      items={items}
      renderTr={({ item: accessRequest }) => <Row accessRequest={accessRequest} />}
    />
  );

  return (
    <div className="flex flex-col gap-5 px-8 w-full h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-heading-2 text-primary">Employees with edit rights</h2>
        <p className="text-body-2 text-secondary">View a list of employees and their assigned edit rights.</p>
      </div>
      <Tabs
        onChange={setActiveTab}
        options={[
          {
            label: 'Granted Access Requests',
            value: 'granted',
          },
          {
            label: 'Pending Access Requests',
            value: 'pending',
          },
        ]}
      />
      {activeTab === 'granted' ? renderTable(grantedAccessRequests) : renderTable(pendingAccessRequests)}
    </div>
  );
};

export default SeeEmployeesWithEditRights;
