import { IcoUserCircle16 } from '@onefootprint/icons';
import { createFontStyles, Divider, Stack } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { usePathname } from 'next/navigation';
import React from 'react';
import styled, { css } from 'styled-components';

import useRoutes from '@/hooks/use-routes/use-routes';

import NavLink from './components/nav-link';

const SideNav = () => {
  const routes = useRoutes();
  const pathname = usePathname();
  const userName = 'John Wick';

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

const User = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-4')}
    color: ${theme.color.tertiary};
  `}
`;

export default SideNav;
