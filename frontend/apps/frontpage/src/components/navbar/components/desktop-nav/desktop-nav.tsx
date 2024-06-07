import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Button, createFontStyles, media } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { NavEntry } from '../../types';
import { isNavLink, isNavMenu } from '../../types';
import DesktopNavLink from './components/desktop-nav-link';
import DesktopNavMenu from './components/desktop-nav-menu';
import LogoCopyAssets from './components/logo-copy-assets';

type DesktopNavProps = {
  entries: NavEntry[];
};

const { Root: NavigationMenuRoot, List: NavigationMenuList } = NavigationMenu;

const DesktopNav = ({ entries }: DesktopNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });

  return (
    <Container>
      <LogoCopyAssets />
      <MainNav>
        {entries.map(entry => {
          if (isNavLink(entry)) {
            return <DesktopNavLink link={entry} key={entry.text} />;
          }
          if (isNavMenu(entry)) {
            return <DesktopNavMenu menu={entry} key={entry.text} />;
          }
          return null;
        })}
      </MainNav>
      <SecondaryNav>
        <Login href={`${DASHBOARD_BASE_URL}/authentication/sign-in`}>{t('login')}</Login>
        <Button onClick={() => window.open(`${DASHBOARD_BASE_URL}/authentication/sign-up`, '_blank')} size="compact">
          {t('sign-up')}
        </Button>
      </SecondaryNav>
    </Container>
  );
};

const Container = styled(NavigationMenuRoot)`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('lg')`
      display: flex;
      align-items: center;
      gap: ${theme.spacing[7]};
      justify-content: space-between;
      };
    `}
  `}
`;

const MainNav = styled(NavigationMenuList)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    align-items: center;
    display: flex;
    position: relative;
    gap: ${theme.spacing[3]};
    justify-content: flex-start;
    width: 100%;
    height: 100%;
  `}
`;

const SecondaryNav = styled(NavigationMenuList)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 180px;
    justify-content: flex-end;
  `}
`;

const Login = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};

    &:hover {
      opacity: 0.7;
    }
  `}
`;

export default DesktopNav;
