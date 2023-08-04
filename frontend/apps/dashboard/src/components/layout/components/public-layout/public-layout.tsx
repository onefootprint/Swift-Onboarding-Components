import styled, { css } from '@onefootprint/styled';
import React from 'react';

type PublicLayoutProps = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: PublicLayoutProps) => (
  <Container data-testid="public-layout">{children}</Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.secondary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
  `}
`;

export default PublicLayout;
