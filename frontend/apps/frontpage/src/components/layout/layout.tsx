import styled from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';

import Footer from '../footer';
import Navbar from '../navbar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <>
    <Navbar />
    <Content>{children}</Content>
    <Footer />
  </>
);

const Content = styled.section`
  position: relative;
  padding-top: calc(var(--mobile-header-height) + var(--mobile-spacing));

  ${media.greaterThan('lg')`
    padding-top: calc(var(--desktop-header-height) + var(--desktop-spacing));
  `}
`;

export default Layout;
