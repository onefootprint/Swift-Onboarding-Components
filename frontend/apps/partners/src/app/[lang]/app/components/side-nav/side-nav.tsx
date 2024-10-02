import { IcoDotsHorizontal16, IcoLogOut24, IcoUserCircle16 } from '@onefootprint/icons';
import { Divider, Dropdown, Stack, createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { usePathname, useRouter } from 'next/navigation';
import styled, { css } from 'styled-components';

import { useClientStore, useRoutes } from '@/hooks';

import NavLink from '../nav-link';

const join = (...args: unknown[]): string => args.filter(Boolean).join(' ');

const SideNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useRoutes();
  const { data } = useClientStore(x => x);
  const userName = join(data.user?.firstName, data.user?.lastName);

  return (
    <NavContainer>
      <Links direction="column">
        {routes.map(({ title, items }) => (
          <TabGroup key={title}>
            {title && <Title>{title}</Title>}
            {items.map(({ text, href, Icon, badgeCount }) => (
              <Element key={text} asChild>
                <NavLink
                  badgeCount={badgeCount}
                  href={href}
                  icon={Icon}
                  selected={pathname.includes(href)}
                  text={text}
                />
              </Element>
            ))}
          </TabGroup>
        ))}
      </Links>
      <Divider />
      <Stack
        align="center"
        direction="row"
        justify="space-between"
        paddingBottom={4}
        paddingLeft={5}
        paddingRight={5}
        paddingTop={4}
      >
        <Stack direction="row" gap={3} align="center" justify="flex-start">
          <IcoUserCircle16 color="tertiary" />
          <User>{userName}</User>
        </Stack>
        <Stack alignItems="center">
          <Dropdown.Root>
            <Dropdown.Trigger aria-label="aria-label">
              <IcoDotsHorizontal16 testID="nav-dropdown-button" />
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content align="start" sideOffset={8}>
                <Dropdown.Item onSelect={() => router.push('/auth/logout')} iconLeft={IcoLogOut24}>
                  Log out
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </Stack>
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
    ${createFontStyles('label-3')}
    color: ${theme.color.tertiary};
    margin-bottom: ${theme.spacing[3]};
    padding: 0 ${theme.spacing[4]};
  `}
`;

const Element = styled(NavigationMenu.Link)``;

const User = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.tertiary};
  `}
`;

export default SideNav;
