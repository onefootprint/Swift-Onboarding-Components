import type { GetAuthRolesOrg } from '@onefootprint/types';
import { Dropdown, LinkButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import TenantItem from './components/tenant-item';

type TenantsListProps = {
  tenants: GetAuthRolesOrg[];
  currTenantId: string;
  onSelect?: (tenantId: string) => void;
};

const NUM_TENANTS_IN_DROPDOWN = 5;

const TenantsList = ({ tenants, currTenantId, onSelect }: TenantsListProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav',
  });
  const [shouldShowAllTenants, setShouldShowAllTenants] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(currTenantId);
  const displayList = shouldShowAllTenants ? tenants : tenants.slice(0, NUM_TENANTS_IN_DROPDOWN);

  const handleClick = (tenantId: string) => {
    setSelectedTenant(tenantId);
    onSelect?.(tenantId);
  };

  const handleToggleAll = () => {
    setShouldShowAllTenants(!shouldShowAllTenants);
  };

  return (
    <>
      <Dropdown.GroupTitle>{t('tenants-list.title')}</Dropdown.GroupTitle>
      {displayList.map(tenant => (
        <TenantItem
          key={tenant.id}
          tenant={tenant}
          onClick={() => handleClick(tenant.id)}
          isSelected={tenant.id === selectedTenant}
        />
      ))}
      {tenants.length > NUM_TENANTS_IN_DROPDOWN && (
        <LinkButton $paddingLeft={5} $paddingBottom={3} $paddingTop={3} onClick={handleToggleAll}>
          {t(shouldShowAllTenants ? 'tenants-list.show-less' : 'tenants-list.show-all')}
        </LinkButton>
      )}
    </>
  );
};

export default TenantsList;
