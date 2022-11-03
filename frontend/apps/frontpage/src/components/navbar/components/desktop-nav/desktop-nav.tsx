import { Box, Button, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { isNavLink, isNavMenu, NavEntry } from '../../types';
import LogoLink from '../logo-link';
import DesktopNavLink from './components/desktop-nav-link/desktop-nav-link';
import DesktopNavMenu from './components/desktop-nav-menu/desktop-nav-menu';

type DesktopNavProps = {
  cta: {
    text: string;
    onClick: () => void;
  };
  entries: NavEntry[];
};

const DesktopNav = ({ cta, entries }: DesktopNavProps) => (
  <Container>
    <LogoLink />
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
    <Box>
      <Button onClick={cta.onClick} fullWidth size="compact">
        {cta.text}
      </Button>
    </Box>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('lg')`
      align-items: center;
      display: flex;
      flex-grow: 1;
      gap: ${theme.spacing[7]};
      justify-content: space-between;
    `}
  `}
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]};
    a {
      ${createFontStyles('label-3')};
      color: ${theme.color.primary};
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

export default DesktopNav;
