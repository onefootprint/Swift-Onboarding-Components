import { LogoFpCompact } from '@onefootprint/icons';
import Link from 'next/link';
import styled, { css } from 'styled-components';

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
