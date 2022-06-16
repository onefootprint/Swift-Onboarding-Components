import React from 'react';
import styled, { css } from 'styled-components';

import CloseButton from '../close-button';

const Header = () => (
  <HeaderContainer id="main-header">
    <CloseButton />
  </HeaderContainer>
);

const HeaderContainer = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px 0 ${theme.spacing[3]}px;
    display: flex;
    align-items: center;

    button {
      position: relative;
      left: -${theme.spacing[3]}px;
    }
  `}
`;

export default Header;
