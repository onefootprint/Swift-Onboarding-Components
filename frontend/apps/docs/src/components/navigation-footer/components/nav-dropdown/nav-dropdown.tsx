import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowTopRight16, IcoDotsHorizontal24, IcoLogOut16 } from '@onefootprint/icons';
import { Box, Dropdown, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import useSession, { type User } from 'src/hooks/use-session';
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
        <Dropdown.Trigger aria-label="Account" variant="icon">
          <IcoDotsHorizontal24 testID="nav-dropdown-button" />
        </Dropdown.Trigger>
        {isOpen && (
          <Dropdown.Portal>
            <Dropdown.Content sideOffset={8} maxWidth="260px" align="start">
              <Dropdown.Group>
                <Box paddingTop={3} paddingBottom={3} paddingLeft={4} paddingRight={4}>
                  {name && (
                    <Text variant="label-3" truncate>
                      {name}
                    </Text>
                  )}
                  <Text variant={!name ? 'label-3' : 'body-3'} color={!name ? 'primary' : 'secondary'} truncate>
                    {email}
                  </Text>
                </Box>
              </Dropdown.Group>
              <Dropdown.Separator />
              <Dropdown.Group>
                <Dropdown.Item iconRight={StyledIcoArrowTopRight16}>
                  <Link href={`${DASHBOARD_BASE_URL}`} target="_blank">
                    {t('dashboard')}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item iconRight={StyledIcoArrowTopRight16}>
                  <Link href={isApiReference ? '/' : API_REFERENCE_PATH} target="_blank">
                    {isApiReference ? t('docs') : t('api-reference')}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button type="button" onClick={handleClickHelp}>
                    {t('help')}
                  </button>
                </Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Separator />
              <Dropdown.Group>
                <Dropdown.Item onSelect={handleLogout} iconLeft={IcoLogOut16}>
                  {t('log-out')}
                </Dropdown.Item>
              </Dropdown.Group>
            </Dropdown.Content>
          </Dropdown.Portal>
        )}
      </Dropdown.Root>
    </>
  );
};

const StyledIcoArrowTopRight16 = styled(IcoArrowTopRight16)`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

export default NavDropdown;
