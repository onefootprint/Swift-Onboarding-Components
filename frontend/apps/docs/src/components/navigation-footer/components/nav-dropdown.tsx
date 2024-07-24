import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16, IcoDotsHorizontal16, IcoLogOut24 } from '@onefootprint/icons';
import { Dropdown, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

type NavDropdownProps = {
  name?: string;
  email: string;
};

const NavDropdown = ({ name, email }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common', { keyPrefix: 'components.nav-dropdown' });
  const { logOut } = useSession();

  const handleLogout = () => {
    logOut();
  };

  return (
    <>
      <Dropdown.Root onOpenChange={setIsOpen} open={isOpen}>
        <Dropdown.Trigger aria-label="Account">
          <IcoDotsHorizontal16 testID="nav-dropdown-button" />
        </Dropdown.Trigger>
        {isOpen && (
          <NavDropdownContent sideOffset={8} $noPadding>
            <UserDropdownItem>
              {name && (
                <Text variant="label-3" truncate>
                  {name}
                </Text>
              )}
              <Text variant={!name ? 'label-3' : 'body-3'} color={!name ? 'primary' : 'secondary'} truncate>
                {email}
              </Text>
            </UserDropdownItem>
            <Dropdown.Separator />
            <Dropdown.Group>
              <StyledLink as={Link} href={`${DASHBOARD_BASE_URL}`} target="_blank">
                {t('dashboard')}
                <IcoArrowUpRight16 color="secondary" />
              </StyledLink>
            </Dropdown.Group>
            <Dropdown.Separator />
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleLogout}>
                <LogoutIcon />
                {t('log-out')}
              </Dropdown.Item>
            </Dropdown.Group>
          </NavDropdownContent>
        )}
      </Dropdown.Root>
    </>
  );
};

const UserDropdownItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    align-items: flex-start;
    flex-direction: column;
    height: 64px;
    overflow: hidden;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    pointer-events: none;
    width: 100%;
    user-select: none;

    & > * {
      max-width: 100%;
    }
  `};
`;

const NavDropdownContent = styled(Dropdown.Content)`
  width: 260px;
  overflow: hidden;
`;

const StyledLink = styled(Dropdown.Item)`
  ${({ theme }) => css`
    text-decoration: none;
    cursor: pointer;

    svg {
      margin-top: ${theme.spacing[1]};
    }
  `}
`;

const LogoutIcon = styled(IcoLogOut24)`
  margin-left: -3px;
`;

export default NavDropdown;
