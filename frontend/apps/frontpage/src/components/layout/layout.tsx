import { media, Stack } from '@onefootprint/ui';
import { getCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styled from 'styled-components';

import Footer from '../footer';
import Navbar from '../navbar';
import CaseStudyBanner from './case-study-banner';

type LayoutProps = {
  children: React.ReactNode;
};

const CASE_STUDY_URL = '/customer-stories/flexcar';

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const isArticlePage = router.pathname.includes(CASE_STUDY_URL);

  const [isBannerVisible, setIsBannerVisible] = useState(
    getCookie('should-show-case-study-banner') !== 'false' && !isArticlePage,
  );

  const handleCloseBanner = () => {
    setCookie('should-show-case-study-banner', 'false');
    setIsBannerVisible(false);
  };

  return (
    <>
      {isBannerVisible && (
        <CaseStudyBanner
          onClose={handleCloseBanner}
          articleUrl={CASE_STUDY_URL}
        />
      )}
      <Navbar />
      {isBannerVisible && <Stack height="48px" tag="span" />}
      <Content>{children}</Content>
      <Footer />
    </>
  );
};
const Content = styled.section`
  position: relative;
  padding-top: calc(var(--mobile-header-height) + var(--mobile-spacing));

  ${media.greaterThan('lg')`
    padding-top: calc(var(--desktop-header-height) + var(--desktop-spacing));
  `}
`;

export default Layout;
