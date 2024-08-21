import type React from 'react';
import styled, { css } from 'styled-components';

import DesktopHeader from './components/desktop-header';

type AppHeaderProps = {
  children?: React.ReactNode;
};

const AppHeader = ({ children }: AppHeaderProps) => (
  <Header>
    <DesktopHeader />
    {children}
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
