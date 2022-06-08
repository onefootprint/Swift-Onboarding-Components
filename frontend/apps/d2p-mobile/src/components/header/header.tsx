import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const Header = () => (
  <Container>
    <Image
      alt="Footprint"
      height={26}
      layout="fixed"
      priority
      src="/images/logo.png"
      width={120}
    />
  </Container>
);

const Container = styled.header`
  ${({ theme }) => css`
    margin: ${theme.spacing[6]}px;
    display: flex;
    align-items: center;
  `}
`;

export default Header;
