import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16, IcoDotsHorizontal16, IcoLogOut24 } from '@onefootprint/icons';
import { Dropdown, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import useSession, { User } from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

type NavDropdownProps = {
  user: User;
  isApiReference: boolean;
  handleOpenSupportDialog: () => void;
};

const NavDropdown = ({ user, isApiReference, handleOpenSupportDialog }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common', { keyPrefix: 'components.navigation-footer.dropdown' });
  const { logOut } = useSession();

  const { firstName, lastName, email } = user;
  const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : undefined;

  const handleLogout = () => {
    logOut();
  };

  const handleClickHelp = () => {
    setIsOpen(false);
    handleOpenSupportDialog();
  };

  return (
    <>
      <Dropdown.Root onOpenChange={setIsOpen} open={isOpen}>
        <StyledTrigger aria-label="Account">
          <IcoDotsHorizontal16 testID="nav-dropdown-button" />
        </StyledTrigger>
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
              <StyledLink as={Link} href={isApiReference ? '/' : API_REFERENCE_PATH}>
                {isApiReference ? t('docs') : t('api-reference')}
                <IcoArrowUpRight16 color="secondary" />
              </StyledLink>
              <StyledLink as={'a'} onClick={handleClickHelp}>
                {t('help')}
              </StyledLink>
            </Dropdown.Group>
            <Dropdown.Separator />
            <Dropdown.Group>
              <LogoutContainer onSelect={handleLogout}>
                <LogoutIcon />
                {t('log-out')}
              </LogoutContainer>
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
  z-index: 1000;
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

const LogoutContainer = styled(Dropdown.Item)`
  ${({ theme }) => css`
    gap: ${theme.spacing[2]};
  `}
`;

const StyledTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};
  `}
`;

export default NavDropdown;
