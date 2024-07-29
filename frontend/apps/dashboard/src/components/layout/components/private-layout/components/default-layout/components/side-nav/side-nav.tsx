import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoUserCircle16 } from '@onefootprint/icons';
import { Box, Divider, Stack, Text, createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useRouter } from 'next/router';
import React from 'react';
import useAssumeAuthRole from 'src/hooks/use-assume-auth-role';
import useAuthRoles from 'src/hooks/use-auth-roles';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import { AssumeRolePurpose } from '@onefootprint/types';
import NavDropdown from './components/nav-dropdown';
import NavLink from './components/nav-link';
import useRoutes from './hooks/use-routes/use-routes';
import moveTenantToFront from './utils/move-tenant-to-front';

const Nav = () => {
  const router = useRouter();
  const {
    dangerouslyCastedData,
    logIn,
    data: { user, org },
  } = useSession();
  const assumeRoleMutation = useAssumeAuthRole();
  const showErrorToast = useRequestErrorToast();
  const routes = useRoutes();
  const tenantsQuery = useAuthRoles(dangerouslyCastedData.auth);
  const currTenantId = dangerouslyCastedData.org.id;
  const { firstName, lastName, email } = dangerouslyCastedData.user;
  const userName = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : undefined;
  const tenants = moveTenantToFront(tenantsQuery.data ?? [], currTenantId);

  const onAssumeTenant = (tenantId: string) => {
    const authToken = dangerouslyCastedData.auth;
    assumeRoleMutation.mutate(
      { tenantId, authToken, purpose: AssumeRolePurpose.dashboard },
      {
        async onSuccess({ token }) {
          await logIn({ auth: token });
          router.reload();
        },
        onError: showErrorToast,
      },
    );
  };

  return (
    <NavContainer>
      <Links direction="column">
        {routes
          .filter(({ employeesOnly }) => !employeesOnly || !!user?.isFirmEmployee)
          .map(({ title, items }) => (
            <TabGroup key={title}>
              {title && <Title>{title}</Title>}
              {items.map(({ text, href, Icon, badgeCount }) => (
                <Element key={text} asChild>
                  <NavLink
                    badgeCount={badgeCount}
                    href={href}
                    icon={Icon}
                    selected={router.pathname.startsWith(href)}
                    text={text}
                  />
                </Element>
              ))}
            </TabGroup>
          ))}
      </Links>
      <Divider />
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        width="100%"
        maxWidth="100%"
        gap={3}
        paddingBottom={4}
        paddingLeft={5}
        paddingRight={5}
        paddingTop={4}
      >
        <Box marginTop={3} height={'100%'}>
          <IcoUserCircle16 color="tertiary" />
        </Box>
        <Stack direction="column" width="100%" maxWidth="100%" overflow="auto">
          <Text variant="body-3" color="primary" truncate width="100%">
            {userName || email}
          </Text>
          <Text variant="body-4" color="tertiary" truncate width="100%">
            {org?.name}
          </Text>
        </Stack>
        <Box>
          <NavDropdown
            currTenantId={currTenantId}
            onAssumeTenant={onAssumeTenant}
            tenants={tenants}
            user={dangerouslyCastedData.user}
          />
        </Box>
      </Stack>
    </NavContainer>
  );
};

const NavContainer = styled(NavigationMenu.Root)`
  ${({ theme }) => css`
    width: var(--side-nav-width);
    max-height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `};
`;

const Links = styled(Stack)`
  ${({ theme }) => css`
    flex: 1;
    overflow: auto;
    padding: ${theme.spacing[5]} ${theme.spacing[4]};
  `}
`;

const TabGroup = styled(NavigationMenu.List)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[8]};
  `};
`;

const Title = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-4')}
    color: ${theme.color.tertiary};
    margin-bottom: ${theme.spacing[3]};
    padding: 0 ${theme.spacing[4]};
  `}
`;

const Element = styled(NavigationMenu.Link)``;

export default Nav;
