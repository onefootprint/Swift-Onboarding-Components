import type { GetAuthRolesOrg } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import OverflowButton from 'src/components/overflow-button';
import type { UserSession } from 'src/hooks/use-session';
import styled from 'styled-components';

import HelpLinks from './components/help-links';
import Logout from './components/log-out';
import TenantsList from './components/tenants-list';
import UserName from './components/user-name/user-name';

type NavDropdownProps = {
  tenants: GetAuthRolesOrg[];
  currTenantId: string;
  onAssumeTenant: (tenantId: string) => void;
  user: UserSession;
};

const NavDropdown = ({
  tenants,
  currTenantId,
  onAssumeTenant,
  user,
}: NavDropdownProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav',
  });
  const router = useRouter();

  const handleLogout = () => {
    router.push('/logout');
  };

  return (
    <Container>
      <Dropdown.Root>
        <OverflowButton ariaLabel="Account" />
        <Dropdown.Portal>
          <NavDropdownContent>
            <UserName
              name={user.firstName}
              lastName={user.lastName}
              email={user.email}
            />
            {tenants?.length > 1 && (
              <TenantsList
                tenants={tenants}
                currTenantId={currTenantId}
                onClick={tenantId => onAssumeTenant(tenantId)}
              />
            )}
            <HelpLinks />
            <Logout onSelect={handleLogout}>{t('log-out')}</Logout>
          </NavDropdownContent>
        </Dropdown.Portal>
      </Dropdown.Root>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
`;

const NavDropdownContent = styled(Dropdown.Content)`
  width: 260px;
  overflow: hidden;
`;

export default NavDropdown;
