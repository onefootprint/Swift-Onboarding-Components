import { LogoFpCompact } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import Link from 'next/link';
import React from 'react';

const Navigation = () => (
  <Container>
    <Link href="https://www.onefootprint.com/">
      <LogoFpCompact />
    </Link>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    padding: ${theme.spacing[7]} 0;
  `}
`;

export default Navigation;
