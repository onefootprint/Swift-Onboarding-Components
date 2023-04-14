import React from 'react';
import styled from 'styled-components';

import Footer from './components/footer';
import SandboxBanner from './components/sandbox-banner';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <Container>
    <SandboxBanner />
    <Content>{children}</Content>
    <Footer />
  </Container>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
`;

export default Layout;
