import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { createFontStyles, media } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import LinkButton from 'src/components/link-button';
import styled, { css } from 'styled-components';

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
      <LogoLink />
      <NavContainer>
        <Nav>
          {entries.map(entry => {
            if (isNavLink(entry)) {
              return <DesktopNavLink link={entry} key={entry.text} />;
            }
            if (isNavMenu(entry)) {
              return <DesktopNavMenu menu={entry} key={entry.text} />;
            }
            return null;
          })}
        </Nav>
        <SecondaryNav>
          <Link href={`${DASHBOARD_BASE_URL}/login`} prefetch>
            {t('login')}
          </Link>
          <LinkButton
            href={`${DASHBOARD_BASE_URL}/sign-up`}
            size="compact"
            prefetch
          >
            {t('sign-up')}
          </LinkButton>
        </SecondaryNav>
      </NavContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('lg')`
      display: flex;
      align-items: center;
      gap: ${theme.spacing[7]};
    `}
  `}
`;

const NavContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]};

    a {
      text-decoration: none;
    }

    a {
      ${createFontStyles('label-3')};
      color: ${theme.color.primary};
      outline-offset: ${theme.spacing[2]};
    }
  `}
`;

const SecondaryNav = styled(Nav)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
  `}
`;

export default DesktopNav;
