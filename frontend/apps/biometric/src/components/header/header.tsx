import { LogoFpDefault } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';

const Header = () => (
  <Container>
    <LogoFpDefault />
  </Container>
);

const Container = styled.header`
  ${({ theme }) => css`
    margin: ${theme.spacing[6]}px;
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

export default Header;
