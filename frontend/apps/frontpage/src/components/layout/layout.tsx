import { media } from '@onefootprint/ui';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Footer from '../footer';
import Navbar from '../navbar';
import CaseStudyBanner from './message-banner';

type LayoutProps = {
  children: React.ReactNode;
};

const ARTICLE_URL = '/blog/footprint-13m-series-a-led-by-qed';

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const isArticlePage = router.pathname.includes(ARTICLE_URL);
  // const isCookieSet = getCookie('should-show-case-study-banner') !== 'false';

  const [isBannerVisible, setIsBannerVisible] =
    useState<boolean>(!isArticlePage);

  const handleCloseBanner = () => {
    setCookie('should-show-case-study-banner', 'false');
    setIsBannerVisible(false);
  };

  return (
    <>
      {isBannerVisible && (
        <CaseStudyBanner
          onClose={handleCloseBanner}
          articleUrl={ARTICLE_URL}
          text="Footprint raised $13M Series A led by QED Investors"
        />
      )}
      <Navbar />
      <Content $shouldShowBanner={isBannerVisible}>{children}</Content>
      <Footer />
    </>
  );
};

const Content = styled.div<{ $shouldShowBanner: boolean }>`
  ${({ $shouldShowBanner }) => css`
    position: relative;
    padding-top: ${$shouldShowBanner
      ? 'calc(var(--mobile-header-height) + var(--mobile-spacing) + 120px)'
      : 'calc(var(--mobile-header-height) + var(--mobile-spacing))'};

    ${media.greaterThan('lg')`
      padding-top: ${
        $shouldShowBanner
          ? 'calc(var(--desktop-header-height) + var(--desktop-spacing) + 56px)'
          : 'calc(var(--desktop-header-height) + var(--desktop-spacing))'
      };
    `}
  `}
`;

export default Layout;
