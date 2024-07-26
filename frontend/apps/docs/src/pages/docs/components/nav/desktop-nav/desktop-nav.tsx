import { media } from '@onefootprint/ui';
import React from 'react';
import AppNav from 'src/components/app-nav';
import NavigationFooter from 'src/components/navigation-footer';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

type DesktopNavProps = {
  navigation: PageNavigation;
};

const DesktopNav = ({ navigation }: DesktopNavProps) => (
  <DesktopNavContainer>
    <NavContainer>
      <AppNav navigation={navigation} />
    </NavContainer>
    <NavigationFooter />
  </DesktopNavContainer>
);

const DesktopNavContainer = styled.aside`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      background: ${theme.backgroundColor.primary};
      border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      display: flex;
      flex-direction: column;
      height: calc(100vh - var(--header-height));
      justify-content: space-between;
      left: 0;
      position: fixed;
      top: var(--header-height);
      width: var(--page-aside-nav-width);
    `};
  `}
`;

const NavContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    overflow: auto;
    padding: ${theme.spacing[7]} ${theme.spacing[3]};
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `}
`;

export default DesktopNav;
