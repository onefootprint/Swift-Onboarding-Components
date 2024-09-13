import { media } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

import Footer from '../footer';
import Navbar from '../navbar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const isBannerVisible = true;

  return (
    <>
      <Navbar />
      <Content data-banner-visible={isBannerVisible}>{children}</Content>
      <Footer />
    </>
  );
};

const Content = styled.main`
  ${({ theme }) => css`
  position: relative;
  padding-top: calc(var(--mobile-header-height) + ${theme.spacing[10]});
  transition: padding-top 0.5s ease-in-out;

    ${media.greaterThan('lg')`
      padding-top: calc(var(--desktop-header-height) + ${theme.spacing[10]});
    `}
  `}
`;

export default Layout;
