import { primitives } from '@onefootprint/design-tokens';
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
  $isOnDarkSection?: boolean;
};

const DesktopNav = ({ entries, $isOnDarkSection }: DesktopNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });

  return (
    <Container>
      <MainNav>
        <LogoCopyAssets $isOnDarkSection={$isOnDarkSection} />
        {entries.map(entry => {
          if (isNavLink(entry)) {
            return (
              <DesktopNavLink
                link={entry}
                key={entry.text}
                $isOnDarkSection={$isOnDarkSection}
              />
            );
          }
          if (isNavMenu(entry)) {
            return (
              <DesktopNavMenu
                menu={entry}
                key={entry.text}
                $isOnDarkSection={$isOnDarkSection}
              />
            );
          }
          return null;
        })}
      </MainNav>
      <SecondaryNav>
        <Login
          href={`${DASHBOARD_BASE_URL}/authentication/sign-in`}
          $isOnDarkSection={$isOnDarkSection}
        >
          {t('login')}
        </Login>
        <StyledButton
          onClick={() =>
            window.open(
              `${DASHBOARD_BASE_URL}/authentication/sign-up`,
              '_blank',
            )
          }
          size="compact"
          $isOnDarkSection={$isOnDarkSection}
        >
          {t('sign-up')}
        </StyledButton>
      </SecondaryNav>
    </Container>
  );
};

const StyledButton = styled(Button)<{ $isOnDarkSection?: boolean }>`
  ${({ $isOnDarkSection }) =>
    $isOnDarkSection &&
    css`
      &&& {
        background-color: ${primitives.Gray800}; /* Dark theme background */
        color: ${primitives.Gray0}; /* Text color for dark theme */
        border-color: ${primitives.Gray700}; /* Border color for dark theme */

        &:hover {
          background-color: ${primitives.Gray700}; /* Darker background on hover */
        }
      }
    `}
`;

const Container = styled(NavigationMenu.Root)`
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

const MainNav = styled(NavigationMenu.List)`
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

const Login = styled(Link)<{ $isOnDarkSection?: boolean }>`
  ${({ theme, $isOnDarkSection }) => css`
    ${createFontStyles('label-3')};
    color: ${$isOnDarkSection ? primitives.Gray0 : theme.color.primary};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  `}
`;

export default DesktopNav;
