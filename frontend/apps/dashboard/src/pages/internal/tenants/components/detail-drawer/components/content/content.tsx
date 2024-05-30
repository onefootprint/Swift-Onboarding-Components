import type { TenantDetail } from '@onefootprint/types';
import { Stack, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';

import BillingProfile from '../billing-profile';
import TenantInfo from '../tenant-info';

type ContentProps = {
  tenant: TenantDetail;
};

enum TabOption {
  tenantInfo = 'tenantInfo',
  billingProfile = 'billingProfile',
}

const Content = ({ tenant }: ContentProps) => {
  const [selectedTab, setSelectedTab] = useState<string>(TabOption.tenantInfo);

  const options = [
    {
      value: TabOption.tenantInfo,
      label: 'Tenant info',
    },
    {
      value: TabOption.billingProfile,
      label: 'Billing profile',
    },
  ];

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <Stack direction="column" gap={7}>
      <Tabs options={options} onChange={handleTabChange} />
      {selectedTab === TabOption.tenantInfo && <TenantInfo tenant={tenant} />}
      {selectedTab === TabOption.billingProfile && (
        <BillingProfile tenant={tenant} />
      )}
    </Stack>
  );
};

export default Content;
