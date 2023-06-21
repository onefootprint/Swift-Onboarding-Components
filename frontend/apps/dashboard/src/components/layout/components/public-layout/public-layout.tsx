import styled from '@onefootprint/styled';
import React from 'react';

type PublicLayoutProps = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: PublicLayoutProps) => (
  <Container data-testid="public-layout">{children}</Container>
);

const Container = styled.div`
  background: linear-gradient(180deg, #f0edff 0%, #ffffff 100%);
`;

export default PublicLayout;
