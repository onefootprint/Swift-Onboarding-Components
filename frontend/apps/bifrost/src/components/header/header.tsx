import React from 'react';
import styled, { css } from 'styled-components';

import CloseButton from '../close-button';

const Header = () => (
  <Container id="main-header">
    <CloseButton />
  </Container>
);

const Container = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px 0 ${theme.spacing[3]}px;
    display: flex;
    align-items: center;
  `}
`;

export default Header;
