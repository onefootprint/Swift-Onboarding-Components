import { useTranslation } from '@onefootprint/hooks';
import { IcoLogOut24, IcoUser24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Dropdown, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

const NavDropdown = () => {
  const { t } = useTranslation('components.private-layout.nav');
  const { dangerouslyCastedData } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/logout');
  };

  return (
    <Container>
      <Dropdown.Root>
        <Dropdown.Trigger aria-label="Account">
          <IcoUser24 />
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <NavDropdownContent align="end">
            <UserDropdownItem>
              <Typography variant="label-3" as="div">
                {dangerouslyCastedData.user.firstName}{' '}
                {dangerouslyCastedData.user.lastName}
              </Typography>
              <Typography variant="body-3" color="secondary" as="div">
                {dangerouslyCastedData.user.email}
              </Typography>
            </UserDropdownItem>
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
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
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
