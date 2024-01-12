import { useTranslation } from '@onefootprint/hooks';
import { IcoLogOut24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { GetAuthRolesOrg } from '@onefootprint/types';
import { Dropdown, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import OverflowButton from 'src/components/overflow-button';
import type { UserSession } from 'src/hooks/use-session';

import TenantsList from './components/tenants-list';

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
  const { t } = useTranslation('components.private-layout.nav');
  const router = useRouter();

  const handleLogout = () => {
    router.push('/logout');
  };

  return (
    <Container>
      <Dropdown.Root>
        <OverflowButton ariaLabel="Account" />
        <Dropdown.Portal>
          <NavDropdownContent align="start" sideOffset={8}>
            <UserDropdownItem>
              <Typography variant="label-3" as="div">
                {`${user.firstName} ${user.lastName}`}
              </Typography>
              <Typography variant="body-3" color="secondary" as="div">
                {user.email}
              </Typography>
            </UserDropdownItem>
            {tenants?.length && (
              <>
                <Dropdown.Divider />
                <Typography
                  variant="label-3"
                  color="tertiary"
                  sx={{ paddingLeft: 5, paddingTop: 3 }}
                >
                  {t('tenants.title')}
                </Typography>
                <TenantsList
                  tenants={tenants}
                  currTenantId={currTenantId}
                  onClick={tenantId => onAssumeTenant(tenantId)}
                />
              </>
            )}
            <Dropdown.Divider />
            <LogoutDropdownItem onSelect={handleLogout}>
              <IcoLogOut24 />
              {t('log-out')}
            </LogoutDropdownItem>
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

const UserDropdownItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    pointer-events: none;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};

    div {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `};
`;

const NavDropdownContent = styled(Dropdown.Content)`
  width: 260px;
`;

const LogoutDropdownItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  `};
`;

export default NavDropdown;
