import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { createFontStyles, media } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import React from 'react';
import LinkButton from 'src/components/linking-button';
import styled, { css, keyframes } from 'styled-components';

import { isNavLink, isNavMenu, NavEntry } from '../../types';
import LogoLink from '../logo-link';
import DesktopNavLink from './components/desktop-nav-link';
import DesktopNavMenu from './components/desktop-nav-menu';

type DesktopNavProps = {
  entries: NavEntry[];
};

const DesktopNav = ({ entries }: DesktopNavProps) => {
  const { t } = useTranslation('components.navbar');

  return (
    <Container>
      <MainNav>
        <LogoLink />
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
        <Login href={`${DASHBOARD_BASE_URL}/login`}>{t('login')}</Login>
        <LinkButton href={`${DASHBOARD_BASE_URL}/sign-up`} size="compact">
          {t('sign-up')}
        </LinkButton>
      </SecondaryNav>
      <ViewportPosition>
        <Viewport />
      </ViewportPosition>
    </Container>
  );
};

const Container = styled(NavigationMenu.Root)`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('lg')`
      display: flex;
      align-items: center;
      gap: ${theme.spacing[7]};
      justify-content: space-between;
    `}
  `}
`;

const MainNav = styled(NavigationMenu.List)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
    justify-content: flex-start;
    width: 100%;
  `}
`;

const SecondaryNav = styled(NavigationMenu.List)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 180px;
    justify-content: flex-end;
  `}
`;

const ViewportPosition = styled.div`
  ${({ theme }) => css`
    position: absolute;
    display: flex;
    justify-content: center;
    width: 100%;
    top: 100%;
    margin-top: ${theme.spacing[2]};
    left: 0;
  `}
`;

const Viewport = styled(NavigationMenu.Viewport)`
  ${({ theme }) => css`
    position: relative;
    transform-origin: top center;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
    padding: ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.primary};

    &[data-state='open'] {
      animation-name: ${slideIn};
      animation-duration: 0.2s;
      animation-timing-function: ease-out;
    }

    &[data-state='closed'] {
      animation-name: ${slideOut};
      animation-duration: 0.1s;
      animation-timing-function: ease-in;
    }
  `}
`;

const slideIn = keyframes`
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-10px);
    opacity: 0;
  }
`;

const Login = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-2')};
    color: ${theme.color.primary};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  `}
`;

export default DesktopNav;
