import styled, { css } from '@onefootprint/styled';
import type { GetAuthRolesOrg } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui/src/utils/mixins/mixins';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import TenantItem from './components/tenant-item';

type TenantsListProps = {
  tenants: GetAuthRolesOrg[];
  currTenantId: string;
  onClick?: (tenantId: string) => void;
};

const NUM_TENANTS_IN_DROPDOWN = 5;

const TenantsList = ({ tenants, currTenantId, onClick }: TenantsListProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav',
  });
  const [shouldShowAllTenants, setShouldShowAllTenants] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(currTenantId);
  const displayList = shouldShowAllTenants
    ? tenants
    : tenants.slice(0, NUM_TENANTS_IN_DROPDOWN);

  const handleClick = (tenantId: string) => {
    setSelectedTenant(tenantId);
    onClick?.(tenantId);
  };

  const toggleShowAll = () => {
    setShouldShowAllTenants(!shouldShowAllTenants);
  };

  return (
    <>
      <TenantsListContainer>
        {displayList.map(tenant => (
          <TenantItem
            key={tenant.id}
            tenant={tenant}
            onClick={() => handleClick(tenant.id)}
            isSelected={tenant.id === selectedTenant}
          />
        ))}
      </TenantsListContainer>
      {tenants.length > NUM_TENANTS_IN_DROPDOWN && (
        <LinkButtonContainer>
          <LinkButton
            onClick={toggleShowAll}
            size="compact"
            sx={{ paddingLeft: 5, paddingBottom: 3 }}
          >
            {t(
              shouldShowAllTenants
                ? 'tenants-list.show-less'
                : 'tenants-list.show-all',
            )}
          </LinkButton>
        </LinkButtonContainer>
      )}
    </>
  );
};

const TenantsListContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    ${createFontStyles('body-3')};
  `};
`;

const LinkButtonContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} 0;
  `}
`;

export default TenantsList;
