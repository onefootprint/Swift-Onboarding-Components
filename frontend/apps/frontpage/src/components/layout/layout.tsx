import { media } from '@onefootprint/ui';
// import { getCookie, setCookie } from 'cookies-next';
// import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';

import Footer from '../footer';
import Navbar from '../navbar';
// import CaseStudyBanner from './message-banner';

type LayoutProps = {
  children: React.ReactNode;
};

// const ARTICLE_URL = '/';

const Layout = ({ children }: LayoutProps) => (
  // const router = useRouter();
  // const isArticlePage = router.pathname.includes(ARTICLE_URL);

  // const [isBannerVisible, setIsBannerVisible] = useState(
  //   getCookie('should-show-case-study-banner') !== 'false' && !isArticlePage,
  // );

  // const handleCloseBanner = () => {
  //   setCookie('should-show-case-study-banner', 'false');
  //   setIsBannerVisible(false);
  // };

  <>
    {/* {isBannerVisible && (
        <CaseStudyBanner
          onClose={handleCloseBanner}
          articleUrl={ARTICLE_URL}
        >
          Footprint raised $13M Series A led by QED Investors
        </CaseStudyBanner>
      )} */}
    <Navbar />
    <Content>{children}</Content>
    <Footer />
  </>
);
const Content = styled.div`
  position: relative;
  padding-top: calc(var(--mobile-header-height) + var(--mobile-spacing));

  ${media.greaterThan('lg')`
    padding-top: calc(var(--desktop-header-height) + var(--desktop-spacing));
  `}
`;

export default Layout;
