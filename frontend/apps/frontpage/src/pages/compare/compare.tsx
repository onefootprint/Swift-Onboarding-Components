import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';
import { Container, media, Typography } from 'ui';

import Carousel from './components/carousel';
import ComparisonTable from './components/comparison-table';
import CompetitorAnalysis from './components/competitor-analysis';
import Hero from './components/hero';

const Compare = () => {
  const { t } = useTranslation('pages.compare');

  return (
    <>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      <HeroContainer>
        <Container>
          <Hero
            cta={t('hero.cta')}
            subtitle={t('hero.subtitle')}
            title={t('hero.title')}
          />
        </Container>
      </HeroContainer>
      <CarouselContainer>
        <Carousel />
      </CarouselContainer>
      <Container>
        <IntroductionContainer>
          <Typography color="primary" variant="body-1" as="p">
            {t('introduction')}
          </Typography>
        </IntroductionContainer>
      </Container>
      <Container>
        <ComparisonTableContainer>
          <ComparisonTable />
        </ComparisonTableContainer>
      </Container>
      <Container>
        <RestContainer>
          <CompetitorAnalysis
            anchor="footprint-vs-rest"
            content={t('competitor.rest.content') as unknown as string[]}
            title={t('competitor.rest.title')}
          />
        </RestContainer>
      </Container>
      <Container>
        <CompetitorAnalysisContainer>
          <CompetitorAnalysis
            anchor="footprint-vs-persona"
            content={t('competitor.persona.content') as unknown as string[]}
            coverImgUrl="/compare/competitor-analysis/persona.png"
            title={t('competitor.persona.title')}
          />
        </CompetitorAnalysisContainer>
      </Container>
      <Container>
        <CompetitorAnalysisContainer>
          <CompetitorAnalysis
            anchor="footprint-vs-alloy"
            content={t('competitor.alloy.content') as unknown as string[]}
            coverImgUrl="/compare/competitor-analysis/alloy.png"
            title={t('competitor.alloy.title')}
          />
        </CompetitorAnalysisContainer>
      </Container>
      <Container>
        <CompetitorAnalysisContainer>
          <CompetitorAnalysis
            anchor="footprint-vs-vgs"
            content={t('competitor.vgs.content') as unknown as string[]}
            coverImgUrl="/compare/competitor-analysis/vgs.png"
            title={t('competitor.vgs.title')}
          />
        </CompetitorAnalysisContainer>
      </Container>
    </>
  );
};

const HeroContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]}px;
  `}
`;

const CarouselContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]}px;
    `}
  `}
`;

const IntroductionContainer = styled.div`
  ${({ theme }) => css`
    max-width: 800px;
    margin: 0 auto ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      text-align: initial;
    `}
  `}
`;

const ComparisonTableContainer = styled.div`
  ${({ theme }) => css`
    overflow: auto;
    margin: 0 -${theme.spacing[5]}px ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      margin: 0 0 ${theme.spacing[10]}px;
      text-align: initial;
    `}
  `}
`;

const RestContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[11]}px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[13]}px;
    `}
  `}
`;

const CompetitorAnalysisContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[11]}px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[13]}px;
    `}
  `}
`;

export default Compare;
