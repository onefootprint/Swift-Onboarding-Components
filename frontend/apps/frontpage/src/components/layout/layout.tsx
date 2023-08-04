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
  overflow: hidden;
  --desktop-padding-top: calc(
    var(--desktop-header-height) + var(--desktop-spacing)
  );
  --mobile-padding-top: calc(
    var(--mobile-header-height) + var(--mobile-spacing)
  );

  > *:first-child {
    padding-top: var(--mobile-padding-top);

    ${media.greaterThan('lg')`
        padding-top: var(--desktop-padding-top);
        
    `}
  }
`;

export default Layout;
