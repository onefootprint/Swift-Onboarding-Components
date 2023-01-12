import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import { createPopup } from '@typeform/embed';
import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';

import Footer from '../footer';
import Navbar from '../navbar';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation('components');
  const router = useRouter();
  const navVariant = router.asPath === '/footprint-live' ? 'min' : 'default';

  return (
    <>
      <Navbar
        navVariant={navVariant}
        cta={{
          text: t('navbar.cta'),
          onClick: toggleTypeform,
        }}
      />
      <Content>{children}</Content>
      <Footer />
    </>
  );
};

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
