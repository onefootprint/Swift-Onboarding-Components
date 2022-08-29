import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, createFontStyles, media } from 'ui';

import { isNavBarLink, isNavBarMenu, NavBarEntry } from '../../types';
import LogoLink from '../logo-link';
import DesktopNavbarLink from './components/desktop-navbar-link';
import DesktopNavbarMenu from './components/desktop-navbar-menu';

type DesktopNavProps = {
  cta: {
    text: string;
    onClick: () => void;
  };
  entries: NavBarEntry[];
};

const DesktopNav = ({ cta, entries }: DesktopNavProps) => (
  <Container>
    <LogoLink />
    <Nav>
      {entries
        .map(entry => {
          if (isNavBarLink(entry)) {
            return <DesktopNavbarLink link={entry} key={entry.text} />;
          }
          if (isNavBarMenu(entry)) {
            return <DesktopNavbarMenu menu={entry} key={entry.text} />;
          }
          return null;
        })
        .filter(elem => !!elem)}
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
      gap: ${theme.spacing[7]}px;
      justify-content: space-between;
    `}
  `}
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]}px;

    a {
      ${createFontStyles('label-3')};
      color: ${theme.color.primary};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    button {
      width: unset;
    }
  `}
`;

export default DesktopNav;
