import type { TenantDetail } from '@onefootprint/types';
import { Stack, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';

import BillingProfile from '../billing-profile';
import TenantInfo from '../tenant-info';
import VendorControl from '../vendor-control';

type ContentProps = {
  tenant: TenantDetail;
};

enum TabOption {
  tenantInfo = 'tenantInfo',
  billingProfile = 'billingProfile',
  vendorControl = 'vendorControl',
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
    {
      value: TabOption.vendorControl,
      label: 'Vendor control',
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
      {selectedTab === TabOption.vendorControl && (
        <VendorControl tenant={tenant} />
      )}
    </Stack>
  );
};

export default Content;
