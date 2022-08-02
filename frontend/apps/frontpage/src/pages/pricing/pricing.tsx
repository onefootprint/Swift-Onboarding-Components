import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

import Faq from './components/faq';
import Plans from './components/plans';

const Pricing = () => {
  const { t } = useTranslation('pages.pricing');
  return (
    <>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      <Container>
        <HeroContainer>
          <Typography
            as="h1"
            sx={{ maxWidth: '700px', marginBottom: 5 }}
            variant="display-1"
          >
            {t('hero.title')}
          </Typography>
          <Typography
            as="h2"
            color="secondary"
            sx={{ maxWidth: '830px' }}
            variant="display-4"
          >
            {t('hero.subtitle')}
          </Typography>
        </HeroContainer>
        <PlansContainer>
          <Plans />
        </PlansContainer>
        <Faq
          title={t('faq.title')}
          items={[
            {
              content: t('faq.questions.credits.content'),
              id: 'credits',
              title: t('faq.questions.credits.title'),
            },
            {
              content: t('faq.questions.get-first-year-free.content'),
              id: 'get-first-year-free',
              title: t('faq.questions.get-first-year-free.title'),
            },
            {
              content: t('faq.questions.one-click-charge.content'),
              id: 'one-click-charge',
              title: t('faq.questions.one-click-charge.title'),
            },
            {
              content: t('faq.questions.competitor-pricing.content'),
              id: 'competitor-pricing',
              title: t('faq.questions.competitor-pricing.title'),
            },
            {
              content: t('faq.questions.business-model.content'),
              id: 'business-model',
              title: t('faq.questions.business-model.title'),
            },
            {
              content: t('faq.questions.disclose-pricing.content'),
              id: 'disclose-pricing',
              title: t('faq.questions.disclose-pricing.title'),
            },
          ]}
        />
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 992px;
    padding: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      padding: 0;
    `}
  `}
`;

const HeroContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin-bottom: ${theme.spacing[8]}px;
    text-align: center;

    ${media.greaterThan('md')`
      margin-bottom: ${theme.spacing[10]}px;
    `}
  `}
`;

const PlansContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]}px;

    ${media.greaterThan('md')`
    margin-bottom: ${theme.spacing[12]}px;
    `}
  `}
`;

export default Pricing;
