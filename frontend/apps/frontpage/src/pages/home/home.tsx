import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled';
import { media } from 'ui';

import Footer from './components/footer';
import GetStartedSection from './components/get-started-section';
import Hero from './components/hero-section';
import HighlightsGradient from './components/highlights-gradient';
import HighlightsSection from './components/highlights-section';
import InvestorsSection from './components/investors-section';
import Navbar from './components/navbar';
import PlaygroundSection from './components/playground-section';
import TestimonialSection from './components/testimonial-section';
import VaultSection from './components/vault-section';
import useContent from './hooks/use-content';

const Home = () => {
  const content = useContent();
  return (
    <>
      <Head>
        <title>{content.title}</title>
      </Head>
      <HeaderContainer>
        <Navbar cta={content.navbar.cta} logoAlt={content.navbar.logoAlt} />
        <Hero
          cta={content.hero.cta}
          imgAlt={content.hero.imgAlt}
          subtitle={content.hero.subtitle}
          title={content.hero.title}
        />
      </HeaderContainer>
      <PlaygroundSection
        title={content.playground.title}
        subtitle={content.playground.subtitle}
        tooltips={content.playground.tooltips}
        instructions={content.playground.instructions}
      />
      <HighlightsContainer>
        <HighlightsGradient />
        <HighlightsSection
          items={content.qualities.items}
          subtitle={content.qualities.subtitle}
          title={content.qualities.title}
        />
        <HighlightsSection
          items={content.advantages.items}
          subtitle={content.advantages.subtitle}
          title={content.advantages.title}
        />
      </HighlightsContainer>
      <TestimonialSection
        author={content.testimonial.author}
        content={content.testimonial.content}
      />
      <VaultSection
        articles={content.vault.articles.secondaries}
        description={content.vault.description}
        mainArticle={content.vault.articles.main}
        subtitle={content.vault.subtitle}
        title={content.vault.title}
      />
      <FooterContainer>
        <InvestorsSection
          imgAlt={content.investors.imgAlt}
          imgSrc={content.investors.imgSrc}
          subtitle={content.investors.subtitle}
          title={content.investors.title}
        />
        <GetStartedSection
          cta={content.getStarted.cta}
          subtitle={content.getStarted.subtitle}
          title={content.getStarted.title}
        />
        <Footer
          copyright={content.footer.copyright}
          links={content.footer.links}
        />
      </FooterContainer>
    </>
  );
};

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[11]}px;
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
  `}
`;

const HighlightsContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    display: grid;
    padding: ${theme.spacing[10]}px 0;
    position: relative;
    row-gap: ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[11]}px 0;
      row-gap: ${theme.spacing[11]}px;
    `}
  `}
`;

const FooterContainer = styled.div`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[10]}px;
    background: ${theme.backgroundColor.tertiary};

    ${media.greaterThan('lg')`
      padding-top: ${theme.spacing[11]}px;
    `}
  `}
`;

export default Home;
