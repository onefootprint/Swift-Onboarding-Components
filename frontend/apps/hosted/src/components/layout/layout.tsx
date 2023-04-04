import React from 'react';
import styled from 'styled-components';

import Footer from './components/footer';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <Container>
    {children}
    <Footer />
  </Container>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export default Layout;
