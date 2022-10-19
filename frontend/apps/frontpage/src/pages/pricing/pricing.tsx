import { useTranslation } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import Faq from './components/faq';
import Plans from './components/plans';

const Pricing = () => {
  const { t } = useTranslation('pages.pricing');
  const { t: faq } = useTranslation('pages.pricing.faq.questions');

  return (
    <>
      <SEO title={t('html-title')} slug="/pricing" />
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
              id: 'credits',
              content: faq('credits.content'),
              title: faq('credits.title'),
            },
            {
              id: 'one-click-kyc-difference',
              content: faq('one-click-kyc-difference.content'),
              title: faq('one-click-kyc-difference.title'),
            },
            {
              id: 'one-click-charge',
              content: faq('one-click-charge.content'),
              title: faq('one-click-charge.title'),
            },
            {
              id: 'how-to-recoup',
              content: faq('how-to-recoup.content'),
              title: faq('how-to-recoup.title'),
            },
            {
              id: 'competitor-pricing',
              content: faq('competitor-pricing.content'),
              title: faq('competitor-pricing.title'),
            },
            {
              id: 'step-up-pricing',
              content: faq('step-up-pricing.content'),
              title: faq('step-up-pricing.title'),
            },
            {
              id: 'failure-charge',
              content: faq('failure-charge.content'),
              title: faq('failure-charge.title'),
            },
            {
              id: 'business-model',
              content: faq('business-model.content'),
              title: faq('business-model.title'),
            },
            {
              id: 'disclose-pricing',
              content: faq('disclose-pricing.content'),
              title: faq('disclose-pricing.title'),
            },
            {
              id: 'drivers-license-scans',
              content: faq('drivers-license-scans.content'),
              title: faq('drivers-license-scans.title'),
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
