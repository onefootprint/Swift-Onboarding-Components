import React from 'react';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

import MobileNav from '../nav/mobile-nav';
import DesktopHeader from './components/desktop-header';

type AppHeaderProps = {
  navigation?: PageNavigation;
};

const AppHeader = ({ navigation }: AppHeaderProps) => (
  <Header>
    <DesktopHeader />
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
