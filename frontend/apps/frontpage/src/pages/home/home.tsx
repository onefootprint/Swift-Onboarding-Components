import { createPopup } from '@typeform/embed';
import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';
import { media } from 'ui';

import HeroSection from './components/hero-section';
import HighlightsSection from './components/highlights-section';
import PlaygroundSection from './components/playground-section';
import TestimonialSection from './components/testimonial-section';
import VaultSection from './components/vault-section';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

const Home = () => {
  const { t } = useTranslation('pages.home');

  return (
    <>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      <HeaderContainer>
        <HeroSection onCtaClick={toggleTypeform} />
      </HeaderContainer>
      <PlaygroundSection />
      <HighlightsContainer id="highlights">
        <HighlightsSection
          items={[
            {
              title: t('qualities.items.security.title'),
              content: t('qualities.items.security.content'),
              imgAlt: t('qualities.items.security.img-alt'),
              imgSrc: '/highlights/security.png',
            },
            {
              title: t('qualities.items.accuracy.title'),
              content: t('qualities.items.accuracy.content'),
              imgAlt: t('qualities.items.accuracy.img-alt'),
              imgSrc: '/highlights/accuracy.png',
            },
            {
              title: t('qualities.items.cheaper.title'),
              content: t('qualities.items.cheaper.content'),
              imgAlt: t('qualities.items.cheaper.img-alt'),
              imgSrc: '/highlights/cheaper.png',
            },
          ]}
          subtitle={t('qualities.subtitle')}
          title={t('qualities.title')}
        />
        <HighlightsSection
          items={[
            {
              title: t('advantages.items.conversion.title'),
              content: t('advantages.items.conversion.content'),
              imgAlt: t('advantages.items.conversion.img-alt'),
              imgSrc: '/highlights/conversion.png',
            },
            {
              title: t('advantages.items.dev.title'),
              content: t('advantages.items.dev.content'),
              imgAlt: t('advantages.items.dev.img-alt'),
              imgSrc: '/highlights/dev.png',
            },
            {
              title: t('advantages.items.cost.title'),
              content: t('advantages.items.cost.content'),
              imgAlt: t('advantages.items.cost.img-alt'),
              imgSrc: '/highlights/cost.png',
            },
          ]}
          subtitle={t('advantages.subtitle')}
          title={t('advantages.title')}
        />
      </HighlightsContainer>
      <TestimonialContainer>
        <TestimonialSection />
      </TestimonialContainer>
      <VaultSection />
    </>
  );
};

const HeaderContainer = styled.section`
  background: linear-gradient(
    180deg,
    #e1ddf9 0%,
    #e4e1fa 11.11%,
    #e8e4fa 22.22%,
    #ebe8fb 33.33%,
    #eeecfc 44.44%,
    #f2f0fc 55.56%,
    #f5f4fd 66.67%,
    #f8f7fe 77.78%,
    #fcfbfe 88.89%,
    #ffffff 100%
  );
`;

const HighlightsContainer = styled.section`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    background-image: url('/images/purple-blur-01.svg'),
      url('/images/green-blur-01.svg'), url('/images/green-blur-02.svg'),
      url('/images/purple-blur-02.svg');
    background-position: 35% 35%, 30% -2%, 0% 74%, 90% 105%;
    background-repeat: no-repeat;
    display: grid;
    padding: ${theme.spacing[10]}px 0;
    position: relative;
    row-gap: ${theme.spacing[10]}px;

    ${media.greaterThan('sm')`
      background-position: -15% 15%, top right, bottom left, 100% 120%;
    `}

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[13]}px 0;
      row-gap: ${theme.spacing[13]}px;
    `}
  `}
`;

const TestimonialContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[10]}px 0;

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[13]}px 0;
    `}
  `}
`;

export default Home;
