import { media } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { useRouter } from 'next/router';
import Footer from '../footer';
import Navbar from '../navbar';

const BANNER_DESKTOP_HEIGHT = 40;
const BANNER_MOBILE_HEIGHT = 72;

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const isBannerVisible = router.query.banner === 'true';

  return (
    <>
      <Navbar />
      <Content data-banner-visible={isBannerVisible}>{children}</Content>
      <Footer />
    </>
  );
};

const Content = styled.main`
  position: relative;
  padding-top: calc(var(--mobile-header-height) + var(--mobile-spacing));
  transition: padding-top 0.5s ease-in-out;

  &[data-banner-visible='true'] {
    padding-top: calc(var(--mobile-header-height) + var(--mobile-spacing) + ${BANNER_MOBILE_HEIGHT}px);
  }

  ${media.greaterThan('lg')`
    padding-top: calc(var(--desktop-header-height) + var(--desktop-spacing));

    &[data-banner-visible='true'] {
      padding-top: calc(var(--desktop-header-height) + var(--desktop-spacing) + ${BANNER_DESKTOP_HEIGHT}px);
    }
  `}
`;

export default Layout;
