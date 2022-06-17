import React from 'react';
import styled, { css } from 'styled-components';
import { FootprintLogo } from 'ui';

const Header = () => (
  <Container>
    <FootprintLogo />
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
