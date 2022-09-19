import { createPopup } from '@typeform/embed';
import { useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { media } from 'ui';

import Navbar from '../navbar';
import Footer from './components/footer';
import GetStartedSection from './components/get-started-section';
import InvestorsSection from './components/investors-section';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation('components');

  return (
    <>
      <Navbar
        cta={{
          text: t('navbar.cta'),
          onClick: toggleTypeform,
        }}
      />
      <Content>{children}</Content>
      <FooterContainer>
        <InvestorsSection
          imgAlt={t('investors.img-alt')}
          imgSrc="/footer/investors.png"
          subtitle={t('investors.subtitle')}
          title={t('investors.title')}
        />
        <GetStartedSection
          cta={t('get-started.cta')}
          onCtaClick={toggleTypeform}
          subtitle={t('get-started.subtitle')}
          title={t('get-started.title')}
        />
        <Footer
          copyright={t('footer.copyright')}
          links={[
            {
              text: t('footer.links.terms-of-service.text'),
              href: t('footer.links.terms-of-service.href'),
              newWindow: false,
            },
            {
              text: t('footer.links.privacy-policy.text'),
              href: t('footer.links.privacy-policy.href'),
              newWindow: false,
            },
            {
              text: t('footer.links.docs.text'),
              href: t('footer.links.docs.href'),
              newWindow: true,
            },
            {
              text: t('footer.links.status.text'),
              href: t('footer.links.status.href'),
              newWindow: true,
            },
            {
              text: t('footer.links.twitter.text'),
              href: t('footer.links.twitter.href'),
              newWindow: true,
            },
          ]}
        />
      </FooterContainer>
    </>
  );
};

const Content = styled.section`
  > *:first-child {
    // TODO: Remove this extra spacing due to the announcement
    padding-top: var(--header-height);
  }
`;

const FooterContainer = styled.section`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[10]}px;
    background: ${theme.backgroundColor.tertiary};

    ${media.greaterThan('lg')`
      padding-top: ${theme.spacing[13]}px;
    `}
  `}
`;

export default Layout;
