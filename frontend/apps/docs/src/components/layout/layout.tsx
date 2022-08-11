import React from 'react';
import styled from 'styled-components';
import { Container } from 'ui';

import PageFooter from './components/page-footer';
import PageHeader from './components/page-header';

export type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <>
    <PageHeader />
    <LayoutContainer>
      <Body>
        <Container>{children}</Container>
      </Body>
    </LayoutContainer>
    <PageFooter />
  </>
);

const LayoutContainer = styled.div`
  flex: 1 0 auto;
`;

const Body = styled.section`
  margin-top: 98px;
`;

export default Layout;
