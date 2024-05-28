import type { TenantDetail } from '@onefootprint/types';
import { Stack, Tab, Tabs } from '@onefootprint/ui';
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
  const [selectedTab, setSelectedTab] = useState<TabOption>(
    TabOption.tenantInfo,
  );

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

  return (
    <Stack direction="column" gap={7}>
      <Tabs>
        {options.map(option => (
          <Tab
            key={option.value}
            onClick={() => setSelectedTab(option.value)}
            selected={selectedTab === option.value}
          >
            {option.label}
          </Tab>
        ))}
      </Tabs>
      {selectedTab === TabOption.tenantInfo && <TenantInfo tenant={tenant} />}
      {selectedTab === TabOption.billingProfile && (
        <BillingProfile tenant={tenant} />
      )}
    </Stack>
  );
};

export default Content;
