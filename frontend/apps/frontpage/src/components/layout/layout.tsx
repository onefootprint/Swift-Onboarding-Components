import { media } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

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

const Content = styled.main`
  position: relative;
  padding-top: calc(var(--mobile-header-height) + var(--mobile-spacing));
  transition: padding-top 0.5s ease-in-out;

  ${media.greaterThan('lg')`
    padding-top: calc(var(--desktop-header-height) + var(--desktop-spacing));
  `}
`;

export default Layout;
