import styled, { css } from '@onefootprint/styled';
import React from 'react';
import type { PageNavigation } from 'src/types/page';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';

type AppHeaderProps = {
  navigation?: PageNavigation;
};

const AppHeader = ({ navigation }: AppHeaderProps) => (
  <Header>
    <DesktopNav />
    <MobileNav navigation={navigation} />
  </Header>
);

const Header = styled.header`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background: ${theme.backgroundColor.primary};
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: ${theme.zIndex.overlay};
  `}
`;

export default AppHeader;
